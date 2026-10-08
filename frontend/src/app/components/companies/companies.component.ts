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
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Corporate Placement Partners</h1>
          <p class="body-text mb-0">Manage employer partnerships, recruiter accounts and corporate onboarding approvals</p>
        </div>
        <button
          *ngIf="isAdmin() || isRecruiter()"
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#companyModal"
          (click)="openAddModal()"
        >
          <i class="bi bi-building-add me-1"></i> Register Partner
        </button>
      </div>

      <!-- Live Partner Metrics Row -->
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-blue"><i class="bi bi-building"></i></div>
            <div class="stat-content">
              <div class="stat-label">Total Partners</div>
              <div class="stat-value text-primary">{{ companies.length }}</div>
              <div class="stat-meta">Registered Organizations</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-emerald"><i class="bi bi-building-check"></i></div>
            <div class="stat-content">
              <div class="stat-label">Active Partners</div>
              <div class="stat-value text-success">{{ getActiveCount() }}</div>
              <div class="stat-meta">Approved for Drives</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-amber"><i class="bi bi-clock-history"></i></div>
            <div class="stat-content">
              <div class="stat-label">Pending Approval</div>
              <div class="stat-value text-warning">{{ getPendingCount() }}</div>
              <div class="stat-meta">Awaiting Verification</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-cyan"><i class="bi bi-globe"></i></div>
            <div class="stat-content">
              <div class="stat-label">Sectors Covered</div>
              <div class="stat-value text-info">{{ getUniqueSectorsCount() }}</div>
              <div class="stat-meta">Industry Domains</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="enterprise-card p-3.5">
        <div class="row g-3">
          <div class="col-md-5">
            <label class="form-label">Search</label>
            <div class="input-group">
              <span class="input-group-text bg-transparent text-muted"><i class="bi bi-search"></i></span>
              <input type="text" [(ngModel)]="search" (ngModelChange)="loadCompanies()" class="form-control" placeholder="Search company, industry, location, email..." />
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Industry Sector</label>
            <select [(ngModel)]="industry" (change)="loadCompanies()" class="form-select">
              <option value="">All Industry Sectors</option>
              <option value="Product Development">Product Development</option>
              <option value="IT / Software">IT / Software</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              <option value="Consulting">Consulting</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Partner Status</label>
            <select [(ngModel)]="filterStatus" (change)="loadCompanies()" class="form-select">
              <option value="">All Partner Statuses</option>
              <option value="Active">Active Partners</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div class="col-md-1 d-flex align-items-end">
            <button class="btn btn-secondary w-100 p-2" (click)="resetFilters()" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Companies Grid -->
      <div *ngIf="!isLoading" class="row g-3">
        <div *ngFor="let c of companies" class="col-12 col-md-6 col-lg-6 col-xl-4">
          <div class="enterprise-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span [class]="getPartnerBadgeClass(c.status)">
                  <i [class]="getPartnerBadgeIcon(c.status) + ' me-1'"></i> {{ c.status || 'Active' }}
                </span>
                <small class="text-muted font-mono">{{ c.employeeCount || '100+ Employees' }}</small>
              </div>

              <div class="d-flex align-items-center mb-3 min-w-0">
                <img [src]="c.logoUrl || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80'" class="rounded-8 me-3 border flex-shrink-0" style="width: 44px; height: 44px; object-fit: cover;" alt="Company Logo" />
                <div class="min-w-0 flex-grow-1">
                  <h4 class="fw-bold text-slate-900 mb-0 text-break">{{ c.name }}</h4>
                  <small class="text-primary fw-semibold text-break">{{ c.industry }}</small>
                </div>
              </div>

              <p class="body-text small mb-3 text-clamp-2 text-break">
                {{ c.description }}
              </p>

              <div class="bg-slate-50 border rounded-8 p-2.5 mb-3 meta-text">
                <div class="mb-1 text-break"><i class="bi bi-geo-alt me-1 text-danger"></i> Location: <strong>{{ c.location || c.headOffice || 'Bangalore' }}</strong></div>
                <div class="mb-1 text-break"><i class="bi bi-globe me-1 text-primary"></i> Website: <a [href]="c.website" target="_blank" class="text-decoration-none fw-semibold text-break">{{ c.website }}</a></div>
                <div class="text-break"><i class="bi bi-person me-1 text-info"></i> HR: <strong>{{ c.hrName || c.contactPerson || 'Recruiter' }}</strong> ({{ c.hrEmail || c.contactEmail || 'hr@company.com' }})</div>
              </div>
            </div>


            <!-- TPO Approval Actions -->
            <div *ngIf="isAdmin()" class="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
              <div class="d-flex gap-1">
                <button
                  *ngIf="c.status !== 'Active'"
                  class="btn btn-success btn-sm py-0.5 px-2.5"
                  style="font-size: 0.75rem;"
                  (click)="approveCompany(c._id!, 'approve')"
                >
                  Approve
                </button>
                <button
                  *ngIf="c.status === 'Active'"
                  class="btn btn-secondary btn-sm py-0.5 px-2 text-warning"
                  style="font-size: 0.75rem;"
                  (click)="approveCompany(c._id!, 'suspend')"
                >
                  Suspend
                </button>
              </div>

              <div class="d-flex gap-1">
                <button class="btn btn-secondary btn-sm py-0.5 px-2" (click)="openEditModal(c)" data-bs-toggle="modal" data-bs-target="#companyModal" title="Edit Partner">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-secondary btn-sm py-0.5 px-2 text-danger" (click)="deleteCompany(c._id!)" title="Delete Partner">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="companies.length === 0" class="col-12 text-center py-5 enterprise-card">
          <div class="saas-empty-state py-3">
            <i class="bi bi-building empty-icon"></i>
            <div class="empty-title">No Corporate Partners Found</div>
            <div class="empty-desc">Adjust your search criteria or register a new corporate recruiting partner.</div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Company Modal -->
      <div class="modal fade" id="companyModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 p-2">
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
                    <label class="form-label">Company Name *</label>
                    <input type="text" formControlName="name" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Industry Sector *</label>
                    <input type="text" formControlName="industry" class="form-control" placeholder="Product Development" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Website URL *</label>
                    <input type="url" formControlName="website" class="form-control" placeholder="https://careers.google.com" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Head Office Location *</label>
                    <input type="text" formControlName="location" class="form-control" placeholder="Bangalore, Karnataka" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">HR Contact Name *</label>
                    <input type="text" formControlName="hrName" class="form-control" placeholder="Sarah Jenkins" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">HR Email Address *</label>
                    <input type="email" formControlName="hrEmail" class="form-control" placeholder="recruitment@google.com" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">HR Contact Phone *</label>
                    <input type="text" formControlName="hrPhone" class="form-control" placeholder="+91 9876543210" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Company Size</label>
                    <input type="text" formControlName="employeeCount" class="form-control" placeholder="1,000 - 5,000 Employees" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">LinkedIn URL</label>
                    <input type="url" formControlName="linkedinUrl" class="form-control" placeholder="https://linkedin.com/company/partner" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Company Overview *</label>
                    <textarea formControlName="description" class="form-control" rows="3" placeholder="Overview of tech stack, hiring domains, and recruitment process..."></textarea>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="companyForm.invalid" class="btn btn-primary px-4" data-bs-dismiss="modal">
                    {{ isEditMode ? 'Update Partner' : 'Save & Register Partner' }}
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
      case 'Active': return 'badge badge-subtle-success font-mono';
      case 'Pending Approval': return 'badge badge-subtle-warning font-mono';
      case 'Suspended': return 'badge badge-subtle-danger font-mono';
      default: return 'badge badge-subtle-success font-mono';
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

  getActiveCount(): number {
    return this.companies.filter(c => c.status === 'Active' || !c.status).length;
  }

  getPendingCount(): number {
    return this.companies.filter(c => c.status === 'Pending Approval').length;
  }

  getUniqueSectorsCount(): number {
    const sectors = new Set(this.companies.map(c => c.industry).filter(Boolean));
    return sectors.size || 4;
  }
}
