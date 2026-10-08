const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Job = require('../models/Job');
const EmailLog = require('../models/EmailLog');
const { sendEmail, isSmtpConfigured } = require('../utils/sendEmail');
const { logActivity } = require('./activityController');
const { createNotification } = require('./notificationController');

// @desc    Create new Online Assessment
// @route   POST /api/assessments
// @access  Private (Admin / Company)
exports.createAssessment = async (req, res, next) => {
  try {
    const { title, description, job: jobId, durationMinutes, startTime, endTime, passingMarks, questions } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Placement Job Drive (job) is required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Placement Job Drive not found.' });
    }

    let calculatedTotalMarks = 0;
    if (questions && Array.isArray(questions)) {
      calculatedTotalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }

    const assessment = await Assessment.create({
      title,
      description,
      company: job.company,
      companyName: job.companyName,
      job: job._id,
      jobTitle: job.title,
      durationMinutes: durationMinutes || 30,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: calculatedTotalMarks || req.body.totalMarks || 100,
      passingMarks: passingMarks || Math.round((calculatedTotalMarks || 100) * 0.4),
      status: req.body.status || 'Draft',
      questions: questions || [],
      createdBy: req.user.id
    });

    await logActivity({
      type: 'ASSESSMENT_CREATED',
      title: `Assessment Created: ${title}`,
      description: `Drive: ${job.companyName} (${job.title}) | Duration: ${assessment.durationMinutes} mins | Questions: ${assessment.questions.length}`,
      actor: req.user.name,
      actorRole: req.user.role,
      targetBranch: job.eligibleBranches && job.eligibleBranches.length > 0 ? job.eligibleBranches.join(', ') : 'All Branches',
      relatedId: assessment._id
    });

    res.status(201).json({
      success: true,
      message: 'Online Assessment created successfully.',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all assessments (Admin/Company sees all; with attempt statistics)
// @route   GET /api/assessments
// @access  Private (Admin / Company)
exports.getAssessments = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.job) filter.job = req.query.job;
    if (req.query.status) filter.status = req.query.status;

    const assessments = await Assessment.find(filter).populate('job').sort({ createdAt: -1 });

    const assessmentIds = assessments.map(a => a._id);
    const attempts = await AssessmentAttempt.find({ assessment: { $in: assessmentIds } });

    const data = assessments.map(a => {
      const aAttempts = attempts.filter(att => att.assessment.toString() === a._id.toString());
      const completedAttempts = aAttempts.filter(att => att.status === 'Submitted');
      const passedCount = completedAttempts.filter(att => att.passed).length;
      const failedCount = completedAttempts.filter(att => !att.passed).length;
      const avgScore = completedAttempts.length > 0
        ? Number((completedAttempts.reduce((sum, att) => sum + att.score, 0) / completedAttempts.length).toFixed(1))
        : 0;

      return {
        ...a.toObject(),
        attemptCount: aAttempts.length,
        completedCount: completedAttempts.length,
        passedCount,
        failedCount,
        avgScore
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('job');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Security: If student is fetching to take test, strip correctAnswer
    if (req.user.role === 'student') {
      const sanitizedQuestions = assessment.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        marks: q.marks
      }));

      return res.status(200).json({
        success: true,
        data: {
          ...assessment.toObject(),
          questions: sanitizedQuestions
        }
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (Admin / Company)
exports.updateAssessment = async (req, res, next) => {
  try {
    let assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (req.body.questions && Array.isArray(req.body.questions)) {
      req.body.totalMarks = req.body.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }

    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully.',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Admin / Company)
exports.deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    await AssessmentAttempt.deleteMany({ assessment: assessment._id });
    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment and all associated attempts removed.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish assessment & dispatch notifications to applied students
// @route   PUT /api/assessments/:id/publish
// @access  Private (Admin / Company)
exports.publishAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('job');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    assessment.status = 'Published';
    await assessment.save();

    // Fetch applied students for this job
    const applications = await Application.find({ job: assessment.job._id }).populate('student');
    const targetStudents = applications.map(a => a.student).filter(Boolean);
    const targetEmails = targetStudents.map(s => s.email).filter(Boolean);

    // Update application stage to 'Online Test'
    for (const app of applications) {
      if (app.status === 'Applied' || app.status === 'Resume Shortlisted') {
        app.status = 'Online Test';
        app.statusTimeline.push({
          status: 'Online Test',
          note: `Online Assessment '${assessment.title}' published. Test window open.`
        });
        await app.save();
      }
    }

    await logActivity({
      type: 'ASSESSMENT_ASSIGNED',
      title: `Assessment Published: ${assessment.title}`,
      description: `Assigned to ${targetStudents.length} candidate(s) for ${assessment.companyName} (${assessment.jobTitle})`,
      actor: req.user.name,
      actorRole: req.user.role,
      targetBranch: assessment.job ? (assessment.job.eligibleBranches || []).join(', ') : 'All Branches',
      relatedId: assessment._id
    });

    for (const st of targetStudents) {
      if (st.user || st._id) {
        await createNotification({
          recipient: st.user || st._id,
          recipientRole: 'student',
          title: `Assessment Assigned: ${assessment.title}`,
          message: `Online recruitment assessment for ${assessment.companyName} (${assessment.jobTitle}) is open. Duration: ${assessment.durationMinutes} mins.`,
          type: 'ASSESSMENT_INVITATION',
          relatedEntity: 'Assessment',
          relatedEntityId: assessment._id,
          link: '/assessments'
        });
      }
    }

    // Dispatch real SMTP notification emails
    let dispatchedCount = 0;
    let failedCount = 0;
    let lastError = null;

    if (targetEmails.length > 0) {
      const emailSubject = `Online Assessment Invitation — ${assessment.companyName} | ${assessment.jobTitle}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="background: #090d16; color: #fff; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="margin: 0; color: #38bdf8;">🎓 University Placement Cell</h2>
            <p style="margin: 5px 0 0; font-size: 12px; color: #94a3b8;">STEP 3: ONLINE RECRUITMENT ASSESSMENT</p>
          </div>
          <div style="padding: 20px 0;">
            <h3 style="color: #0f172a; margin-top: 0;">Online Assessment Call: ${assessment.title}</h3>
            <p style="color: #334155; line-height: 1.6;">
              Dear Candidate,<br><br>
              You have been invited to attempt the Online Recruitment Assessment for <strong>${assessment.companyName}</strong> for the role of <strong>${assessment.jobTitle}</strong>.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <div><strong>Duration:</strong> ${assessment.durationMinutes} Minutes</div>
              <div><strong>Total Questions:</strong> ${assessment.questions.length} Questions</div>
              <div><strong>Passing Cutoff:</strong> ${assessment.passingMarks} Marks</div>
              <div><strong>Status:</strong> Active & Ready to Attempt</div>
            </div>
            <p style="color: #475569; font-size: 13px;">
              Please log in to your Student Portal, navigate to the <strong>Online Assessments</strong> tab, and click <strong>Start Assessment</strong>. Ensure you have an uninterrupted internet connection.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
            Training & Placement Cell • University Campus • Official Candidate Notification
          </div>
        </div>
      `;

      for (const email of targetEmails) {
        const resSend = await sendEmail({
          to: email,
          subject: emailSubject,
          html: emailHtml,
          text: `Online Assessment Invitation: ${assessment.title} for ${assessment.companyName}. Duration: ${assessment.durationMinutes} mins. Log into your student portal to attempt.`
        });
        if (resSend.success) {
          dispatchedCount++;
        } else {
          failedCount++;
          lastError = resSend.error;
        }
      }

      await EmailLog.create({
        sender: 'University Placement Cell',
        recipient: targetEmails[0] || 'Target Candidates',
        recipientEmails: targetEmails,
        recipientCount: targetEmails.length,
        subject: emailSubject,
        type: 'Assessment Invitation',
        template: 'Custom Broadcast',
        recipientGroup: assessment.jobTitle || 'Drive Candidates',
        successCount: dispatchedCount,
        failureCount: failedCount,
        status: isSmtpConfigured() ? (failedCount === 0 ? 'Sent' : dispatchedCount > 0 ? 'Partially Failed' : 'Failed') : 'SMTP Not Configured',
        errorMessage: lastError,
        sentAt: new Date(),
        sentBy: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      message: `Assessment published! Dispatched assessment notifications to ${dispatchedCount} candidate(s).`,
      data: assessment,
      dispatchedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessments assigned to logged-in student
// @route   GET /api/assessments/student/my
// @access  Private (Student)
exports.getStudentAssessments = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = await Student.findOne({ email: req.user.email });

    if (!student) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Find jobs student applied for
    const applications = await Application.find({ student: student._id });
    const appliedJobIds = applications.map(a => a.job);

    // Find published assessments for applied drives
    const assessments = await Assessment.find({
      job: { $in: appliedJobIds },
      status: 'Published'
    }).populate('job').sort({ createdAt: -1 });

    const assessmentIds = assessments.map(a => a._id);
    const attempts = await AssessmentAttempt.find({
      assessment: { $in: assessmentIds },
      student: student._id
    });

    const data = assessments.map(a => {
      const attempt = attempts.find(att => att.assessment.toString() === a._id.toString());
      const application = applications.find(app => app.job.toString() === a.job._id.toString());

      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        companyName: a.companyName,
        jobTitle: a.jobTitle,
        jobId: a.job._id,
        durationMinutes: a.durationMinutes,
        totalMarks: a.totalMarks,
        passingMarks: a.passingMarks,
        questionCount: a.questions.length,
        status: a.status,
        startTime: a.startTime,
        endTime: a.endTime,
        applicationStatus: application ? application.status : 'Applied',
        attempt: attempt ? {
          _id: attempt._id,
          status: attempt.status,
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student starts an assessment (creates real AssessmentAttempt & returns questions without answers)
// @route   POST /api/assessments/:id/start
// @access  Private (Student)
exports.startAssessment = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = await Student.findOne({ email: req.user.email });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.status !== 'Published') {
      return res.status(400).json({ success: false, message: 'This assessment is not currently active.' });
    }

    // Check if attempt already exists
    let attempt = await AssessmentAttempt.findOne({ assessment: assessment._id, student: student._id });

    if (attempt && attempt.status === 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assessment. Duplicate attempts are not permitted.',
        attempt
      });
    }

    if (!attempt) {
      attempt = await AssessmentAttempt.create({
        assessment: assessment._id,
        job: assessment.job,
        student: student._id,
        studentUser: req.user.id,
        studentName: student.fullName,
        studentEmail: student.email,
        startedAt: new Date(),
        status: 'In Progress'
      });
    }

    // Strip correct answers
    const sanitizedQuestions = assessment.questions.map((q, idx) => ({
      index: idx,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      marks: q.marks
    }));

    res.status(200).json({
      success: true,
      message: 'Assessment session started.',
      data: {
        attemptId: attempt._id,
        assessmentTitle: assessment.title,
        companyName: assessment.companyName,
        jobTitle: assessment.jobTitle,
        durationMinutes: assessment.durationMinutes,
        totalMarks: assessment.totalMarks,
        passingMarks: assessment.passingMarks,
        startedAt: attempt.startedAt,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student submits assessment answers (Backend scoring & verification)
// @route   POST /api/assessments/:id/submit
// @access  Private (Student)
exports.submitAssessment = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body;

    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = await Student.findOne({ email: req.user.email });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    let attempt = null;
    if (attemptId) {
      attempt = await AssessmentAttempt.findById(attemptId);
    }
    if (!attempt) {
      attempt = await AssessmentAttempt.findOne({ assessment: assessment._id, student: student._id });
    }

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt session not found.' });
    }

    if (attempt.status === 'Submitted') {
      return res.status(400).json({ success: false, message: 'Assessment is already submitted.' });
    }

    // BACKEND OBJECTIVE SCORING ENGINE
    let totalScore = 0;
    const evaluatedAnswers = [];
    const questions = assessment.questions || [];

    (answers || []).forEach(ans => {
      const qIndex = Number(ans.questionIndex);
      const selOpt = Number(ans.selectedOption);

      if (qIndex >= 0 && qIndex < questions.length) {
        const question = questions[qIndex];
        const isCorrect = selOpt === question.correctAnswer;
        const qMarks = Number(question.marks) || 1;

        if (isCorrect) {
          totalScore += qMarks;
        }

        evaluatedAnswers.push({
          questionIndex: qIndex,
          selectedOption: selOpt,
          isCorrect
        });
      }
    });

    const totalMarks = assessment.totalMarks || (questions.length * 1) || 100;
    const percentage = Number(((totalScore / totalMarks) * 100).toFixed(1));
    const passed = totalScore >= assessment.passingMarks;

    attempt.answers = evaluatedAnswers;
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = 'Submitted';
    attempt.submittedAt = new Date();
    await attempt.save();

    // STAGE 3 -> 4 ADVANCEMENT: Update application pipeline
    const application = await Application.findOne({ job: assessment.job, student: student._id });
    if (application) {
      if (passed) {
        application.status = 'Aptitude Test Cleared';
        application.statusTimeline.push({
          status: 'Aptitude Test Cleared',
          note: `Passed Online Assessment '${assessment.title}' with ${totalScore}/${totalMarks} marks (${percentage}%). Candidate qualified for technical rounds.`
        });
      } else {
        application.statusTimeline.push({
          status: 'Online Test',
          note: `Completed Online Assessment '${assessment.title}' with ${totalScore}/${totalMarks} marks (${percentage}%). Below passing cutoff (${assessment.passingMarks}).`
        });
      }
      await application.save();
    }

    await logActivity({
      type: passed ? 'ASSESSMENT_PASSED' : 'ASSESSMENT_FAILED',
      title: `${student.fullName} ${passed ? 'Passed' : 'Completed'} Assessment: ${assessment.title}`,
      description: `Score: ${totalScore}/${totalMarks} (${percentage}%) | Drive: ${assessment.companyName} (${assessment.jobTitle})`,
      actor: student.fullName,
      actorRole: 'student',
      targetBranch: student.branch || 'All Branches',
      relatedId: attempt._id
    });

    if (student.user || student._id) {
      await createNotification({
        recipient: student.user || student._id,
        recipientRole: 'student',
        title: passed ? 'Assessment Result: Qualified' : 'Assessment Result: Completed',
        message: passed
          ? `Congratulations! You scored ${totalScore}/${totalMarks} (${percentage}%) on ${assessment.title} and qualified for next rounds.`
          : `You scored ${totalScore}/${totalMarks} (${percentage}%) on ${assessment.title}.`,
        type: 'ASSESSMENT_RESULT',
        relatedEntity: 'Assessment',
        relatedEntityId: assessment._id,
        link: '/assessments'
      });
    }

    res.status(200).json({
      success: true,
      message: passed
        ? `🎉 Congratulations! You cleared the assessment with a score of ${totalScore}/${totalMarks} (${percentage}%).`
        : `Assessment submitted. Your score is ${totalScore}/${totalMarks} (${percentage}%).`,
      data: {
        attemptId: attempt._id,
        assessmentTitle: assessment.title,
        companyName: assessment.companyName,
        jobTitle: assessment.jobTitle,
        score: totalScore,
        totalMarks,
        passingMarks: assessment.passingMarks,
        percentage,
        passed,
        submittedAt: attempt.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin / Recruiter view candidate attempts for an assessment
// @route   GET /api/assessments/:id/attempts
// @access  Private (Admin / Company)
exports.getAssessmentAttempts = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ assessment: req.params.id })
      .populate('student')
      .populate('job')
      .sort({ score: -1, submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin / Recruiter shortlist candidates based on assessment performance
// @route   POST /api/assessments/:id/shortlist
// @access  Private (Admin / Company)
exports.shortlistFromAssessment = async (req, res, next) => {
  try {
    const { studentIds, targetStatus, note } = req.body;
    // targetStatus: 'Resume Shortlisted' | 'Technical Interview Cleared' | 'Shortlisted'

    const assessment = await Assessment.findById(req.params.id).populate('job');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    let query = { job: assessment.job._id };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query.student = { $in: studentIds };
    } else {
      // Shortlist all passed students by default
      const passedAttempts = await AssessmentAttempt.find({ assessment: assessment._id, passed: true });
      const passedStudentIds = passedAttempts.map(att => att.student);
      query.student = { $in: passedStudentIds };
    }

    const applications = await Application.find(query);
    const newStatus = targetStatus || 'Resume Shortlisted';

    let updatedCount = 0;
    for (const app of applications) {
      app.status = newStatus;
      app.statusTimeline.push({
        status: newStatus,
        note: note || `Candidate shortlisted by TPO based on Assessment '${assessment.title}' cutoff clearance.`
      });
      await app.save();
      updatedCount++;
    }

    await logActivity({
      type: 'STATUS_UPDATED',
      title: `Shortlisted ${updatedCount} candidates from Assessment: ${assessment.title}`,
      description: `Drive: ${assessment.companyName} (${assessment.jobTitle}) -> Advanced to '${newStatus}'`,
      actor: req.user.name,
      actorRole: req.user.role,
      targetBranch: assessment.job ? (assessment.job.eligibleBranches || []).join(', ') : 'All Branches',
      relatedId: assessment._id
    });

    res.status(200).json({
      success: true,
      message: `Successfully shortlisted ${updatedCount} candidate(s) to '${newStatus}'.`,
      updatedCount
    });
  } catch (error) {
    next(error);
  }
};
