export interface Question {
  _id?: string;
  questionText: string;
  type?: string;
  options: string[];
  correctAnswer?: number;
  marks?: number;
}

export interface Assessment {
  _id?: string;
  title: string;
  description?: string;
  company?: any;
  companyName: string;
  job?: any;
  jobTitle: string;
  jobId?: string;
  durationMinutes: number;
  startTime?: string;
  endTime?: string;
  totalMarks: number;
  passingMarks: number;
  status: 'Draft' | 'Published' | 'Archived';
  questions: Question[];
  questionCount?: number;
  attemptCount?: number;
  completedCount?: number;
  passedCount?: number;
  failedCount?: number;
  avgScore?: number;
  applicationStatus?: string;
  attempt?: AssessmentAttemptSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentAttemptSummary {
  _id: string;
  status: 'In Progress' | 'Submitted' | 'Timed Out';
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface AssessmentAttemptDetail {
  _id: string;
  assessment: any;
  job: any;
  student: any;
  studentName: string;
  studentEmail: string;
  score: number;
  percentage: number;
  passed: boolean;
  status: string;
  startedAt: string;
  submittedAt?: string;
  answers?: Array<{
    questionIndex: number;
    selectedOption: number;
    isCorrect?: boolean;
  }>;
}

export interface StartAssessmentResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    assessmentTitle: string;
    companyName: string;
    jobTitle: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    startedAt: string;
    questions: Array<{
      index: number;
      questionText: string;
      type: string;
      options: string[];
      marks: number;
    }>;
  };
}

export interface SubmitAssessmentResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    assessmentTitle: string;
    companyName: string;
    jobTitle: string;
    score: number;
    totalMarks: number;
    passingMarks: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
  };
}
