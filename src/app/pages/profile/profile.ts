
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user';
import { UserProfileModel } from '../../core/models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
 
  profile = signal<UserProfileModel | null>(null);
  activeTab = signal<'info' | 'avatar' | 'password'>('info');
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  selectedAvatar = signal<string | null>(null);
 
  // Preset avatar collection using DiceBear — free, no attribution needed
  avatarOptions: string[] = [
  ...Array.from({ length: 8 }, (_, i) =>
    `https://api.dicebear.com/8.x/adventurer/svg?seed=${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) =>
    `https://api.dicebear.com/8.x/bottts/svg?seed=${i + 1}`),
];
 
  infoForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: [''],
    bio: [''],
  });
 
  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordsMatch }
  );
 
  ngOnInit() {
    this.loading.set(true);
    this.userService.getMe().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.infoForm.patchValue({
          name: data.name,
          phoneNumber: data.phoneNumber ?? '',
          bio: data.bio ?? '',
        });
        this.loading.set(false);
      },
      error: () => this.flashError('Failed to load profile.'),
    });
  }
 
  saveInfo() {
    if (this.infoForm.invalid) return;
    this.loading.set(true);
    this.userService.updateProfile(this.infoForm.value).subscribe({
      next: (data) => { this.profile.set(data); this.flash('Profile updated successfully.'); },
      error: () => this.flashError('Failed to update profile.'),
    });
  }
 
  selectAvatar(url: string) {
    this.selectedAvatar.set(url);
  }
 
  saveAvatar() {
    const url = this.selectedAvatar();
    if (!url) return;
    this.loading.set(true);
    this.userService.updateAvatar({ avatarUrl: url }).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.selectedAvatar.set(null);
        this.flash('Avatar updated successfully.');
      },
      error: () => this.flashError('Failed to update avatar.'),
    });
  }
 
  savePassword() {
    if (this.passwordForm.invalid) return;
    this.loading.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => { this.passwordForm.reset(); this.flash('Password changed successfully.'); },
      error: () => this.flashError('Failed to change password. Check your current password.'),
    });
  }
 
  get avatarInitials(): string {
    return (this.profile()?.name ?? '')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
 
  private passwordsMatch(group: FormGroup) {
    const np = group.get('newPassword')?.value;
    const cp = group.get('confirmPassword')?.value;
    return np === cp ? null : { mismatch: true };
  }
 
  private flash(msg: string) {
    this.loading.set(false);
    this.errorMsg.set('');
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }
 
  private flashError(msg: string) {
    this.loading.set(false);
    this.successMsg.set('');
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(''), 3500);
  }
}