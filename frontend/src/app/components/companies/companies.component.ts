import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid px-4 py-3">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-building-fill text-primary me-2"></i>Stage 2: Corporate Placement Partners</h3>
          <p class="text-muted mb-0">Recruiter directory, partner onboarding & TPO Approval Queue</p>
        </div>
        <button
          *ngIf="isAdmin() || isRecruiter()"
          class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
          data-bs-toggle="modal"
          data-bs-target="#companyModal"
          (click)="openAddModal()"
        >
          <i class="bi bi-building-add me-2"></i> Register Recruiting Partner
        </button>
      </div>

      <!-- Search & Status Filter Tabs -->
      <div class="enterprise-card p-4 mb-4 bg-white">
        <div class="row g-3">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" [(ngModel)]="search" (ngModelChange)="loadCompanies()" class="form-control border-slate-300" placeholder="Search company, industry, head office, HR email..." />
            </div>
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="industry" (change)="loadCompanies()" class="form-select border-slate-300">
              <option value="">All Industry Sectors</option>
              <option value="Product Development">Product Development</option>
              <option value="IT / Software">IT / Software</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              <option value="Consulting">Consulting</option>
            </select>
          </div>
          <div class="col-md-2">
            <select [(ngModel)]="filterStatus" (change)="loadCompanies()" class="form-select border-slate-300">
              <option value="">All Partner Statuses</option>
              <option value="Active">Active Partners</option>
              <option value="Pending Approval">Pending TPO Approval</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-secondary w-100 rounded-pill" (click)="resetFilters()">Reset Filters</button>
          </div>
        </div>
      </div>

      <!-- Companies Professional Cards Grid -->
      <div *ngIf="!isLoading" class="row g-3">
        <div *ngFor="let c of companies" class="col-md-6 col-lg-4">
          <div class="enterprise-card p-4 h-100 d-flex flex-column">
            <!-- Top Status Badge -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span [class]="getPartnerBadgeClass(c.status)">
                <i [class]="getPartnerBadgeIcon(c.status) + ' me-1'"></i> {{ c.status || 'Active' }}
              </span>
              <small class="text-muted font-monospace">{{ c.employeeCount || '100+ Employees' }}</small>
            </div>

            <div class="d-flex align-items-center mb-3">
              <img [src]="c.logoUrl || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80'" class="rounded-16 me-3 border p-1" style="width: 54px; height: 54px; object-fit: cover;" />
              <div>
                <h5 class="fw-bold text-slate-900 mb-0">{{ c.name }}</h5>
                <small class="text-primary fw-semibold">{{ c.industry }}</small>
              </div>
            </div>

            <p class="text-slate-600 small mb-3 flex-grow-1">
              {{ c.description }}
            </p>

            <div class="bg-slate-50 border rounded-12 p-3 mb-3 small">
              <div class="text-slate-700 mb-1"><i class="bi bi-geo-alt me-1 text-danger"></i>Head Office: <strong>{{ c.location || c.headOffice || 'Bangalore' }}</strong></div>
              <div class="text-slate-700 mb-1"><i class="bi bi-globe me-1 text-primary"></i>Website: <a [href]="c.website" target="_blank" class="text-decoration-none fw-bold">{{ c.website }}</a></div>
              <div class="text-slate-700"><i class="bi bi-person me-1 text-info"></i>HR Contact: <strong>{{ c.hrName || c.contactPerson || 'Recruitment HR' }}</strong> ({{ c.hrEmail || c.contactEmail || 'hr@company.com' }})</div>
            </div>

            <!-- TPO Approval Actions -->
            <div *ngIf="isAdmin()" class="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
              <div class="d-flex gap-1">
                <button
                  *ngIf="c.status !== 'Active'"
                  class="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold shadow-sm"
                  style="font-size: 0.75rem;"
                  (click)="approveCompany(c._id!, 'approve')"
                >
                  Approve / Activate
                </button>
                <button
                  *ngIf="c.status === 'Active'"
                  class="btn btn-sm btn-outline-warning rounded-pill px-2 py-1"
                  style="font-size: 0.75rem;"
                  (click)="approveCompany(c._id!, 'suspend')"
                >
                  Suspend
                </button>
              </div>

              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-secondary rounded-pill px-2" (click)="openEditModal(c)" data-bs-toggle="modal" data-bs-target="#companyModal">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-danger rounded-circle" (click)="deleteCompany(c._id!)">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="companies.length === 0" class="col-12 text-center py-5 enterprise-card">
          <i class="bi bi-building fs-1 text-slate-300"></i>
          <h5 class="text-slate-900 mt-3">No Corporate Partners Found</h5>
          <p class="text-muted mb-0">Adjust search filter or register a new corporate partner.</p>
        </div>
      </div>

      <!-- Add/Edit Company Modal -->
      <div class="modal fade" id="companyModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content enterprise-card border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-building text-primary me-2"></i>
                {{ isEditMode ? 'Edit Partner Company Profile' : 'Register Corporate Recruiting Partner' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="companyForm" (ngSubmit)="onSaveCompany()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Company Name</label>
                    <input type="text" formControlName="name" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Industry Sector</label>
                    <input type="text" formControlName="industry" class="form-control" placeholder="Product Development" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Official Website URL</label>
                    <input type="url" formControlName="website" class="form-control" placeholder="https://careers.google.com" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Head Office Location</label>
                    <input type="text" formControlName="location" class="form-control" placeholder="Bangalore, Karnataka" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700">HR Name</label>
                    <input type="text" formControlName="hrName" class="form-control" placeholder="Sarah Jenkins" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700">HR Contact Email</label>
                    <input type="email" formControlName="hrEmail" class="form-control" placeholder="recruitment@google.com" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700">HR Contact Phone</label>
                    <input type="text" formControlName="hrPhone" class="form-control" placeholder="+91 9876543210" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Company Size (Employees)</label>
                    <input type="text" formControlName="employeeCount" class="form-control" placeholder="1,000 - 5,000 Employees" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">LinkedIn Company URL</label>
                    <input type="url" formControlName="linkedinUrl" class="form-control" placeholder="https://linkedin.com/company/partner" />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-slate-700">Company Overview</label>
                    <textarea formControlName="description" class="form-control" rows="3" placeholder="Overview of tech stack, product development, and hiring goals..."></textarea>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2 rounded-pill" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="companyForm.invalid" class="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-dismiss="modal">
                    {{ isEditMode ? 'Update Partner' : 'Save & Submit Partner' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  companies: Company[] = [];
  isLoading = true;
  isEditMode = false;
  editingId: string | null = null;

  search = '';
  industry = '';
  filterStatus = '';

  companyForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    industry: ['Product Development', Validators.required],
    website: ['https://careers.google.com', Validators.required],
    location: ['Bangalore, Karnataka', Validators.required],
    hrName: ['Recruitment HR', Validators.required],
    hrEmail: ['recruitment@partner.com', [Validators.required, Validators.email]],
    hrPhone: ['+91 9876543210', Validators.required],
    employeeCount: ['1,000 - 5,000 Employees', Validators.required],
    linkedinUrl: ['https://linkedin.com/company/partner', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  isAdmin(): boolean { return this.authService.getUserRole() === 'admin'; }
  isRecruiter(): boolean { return this.authService.getUserRole() === 'company'; }

  loadCompanies(): void {
    this.isLoading = true;
    this.companyService.getCompanies({ search: this.search, industry: this.industry, status: this.filterStatus }).subscribe({
      next: (res) => {
        this.companies = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.search = '';
    this.industry = '';
    this.filterStatus = '';
    this.loadCompanies();
  }

  approveCompany(id: string, action: 'approve' | 'reject' | 'suspend' | 'activate'): void {
    this.companyService.approveCompany(id, action).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message || `Partner status updated to ${action}`);
        this.loadCompanies();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Approval update failed')
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.companyForm.reset({
      industry: 'Product Development',
      website: 'https://careers.google.com',
      location: 'Bangalore, Karnataka',
      hrName: 'Recruitment HR',
      hrEmail: 'hr@partner.com',
      hrPhone: '+91 9876543210',
      employeeCount: '1,000 - 5,000 Employees',
      linkedinUrl: 'https://linkedin.com/company/partner'
    });
  }

  openEditModal(c: Company): void {
    this.isEditMode = true;
    this.editingId = c._id!;
    this.companyForm.patchValue({
      name: c.name,
      industry: c.industry,
      website: c.website,
      location: c.location || c.headOffice,
      hrName: c.hrName || c.contactPerson,
      hrEmail: c.hrEmail || c.contactEmail,
      hrPhone: c.hrPhone || '+91 9876543210',
      employeeCount: c.employeeCount || '1,000 - 5,000 Employees',
      linkedinUrl: c.linkedinUrl || 'https://linkedin.com/company/partner',
      description: c.description
    });
  }

  onSaveCompany(): void {
    if (this.companyForm.invalid) return;

    const payload = {
      ...this.companyForm.value,
      contactPerson: this.companyForm.value.hrName,
      contactEmail: this.companyForm.value.hrEmail,
      headOffice: this.companyForm.value.location
    };

    if (this.isEditMode && this.editingId) {
      this.companyService.updateCompany(this.editingId, payload).subscribe({
        next: () => {
          this.notify.showSuccess('Company profile updated!');
          this.loadCompanies();
        },
        error: (err) => this.notify.showError(err.error?.message || 'Update failed')
      });
    } else {
      this.companyService.createCompany(payload).subscribe({
        next: (res) => {
          this.notify.showSuccess(res.message || 'Recruiting partner registered!');
          this.loadCompanies();
        },
        error: (err) => this.notify.showError(err.error?.message || 'Creation failed')
      });
    }
  }

  deleteCompany(id: string): void {
    if (!confirm('Are you sure you want to delete this partner record?')) return;
    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this.notify.showSuccess('Company record deleted');
        this.loadCompanies();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Delete failed')
    });
  }

  getPartnerBadgeClass(status?: string): string {
    switch (status) {
      case 'Active': return 'badge bg-success text-white rounded-pill px-3 py-1 font-monospace';
      case 'Pending Approval': return 'badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace';
      case 'Suspended': return 'badge bg-danger text-white rounded-pill px-3 py-1 font-monospace';
      default: return 'badge bg-success text-white rounded-pill px-3 py-1 font-monospace';
    }
  }

  getPartnerBadgeIcon(status?: string): string {
    switch (status) {
      case 'Active': return 'bi-check-circle-fill';
      case 'Pending Approval': return 'bi-clock-history';
      case 'Suspended': return 'bi-slash-circle';
      default: return 'bi-check-circle-fill';
    }
  }
}
