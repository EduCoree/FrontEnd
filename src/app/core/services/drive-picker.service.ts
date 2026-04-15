import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  /** Direct download URL usable as fileUrl */
  url: string;
  sizeBytes?: number;
}

declare const gapi: any;
declare const google: any;

@Injectable({ providedIn: 'root' })
export class DrivePickerService {

  private gapiLoaded = false;
  private tokenClient: any;
  private accessToken: string | null = null;

  /** Load gapi picker library once */
  private loadGapi(): Promise<void> {
    if (this.gapiLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        reject(new Error('Google API script not loaded. Check index.html.'));
        return;
      }
      gapi.load('picker', () => {
        this.gapiLoaded = true;
        resolve();
      });
    });
  }

  /** Get a fresh OAuth2 token using Google Identity Services */
  private getToken(): Promise<string> {
    if (this.accessToken) return Promise.resolve(this.accessToken);

    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded.'));
        return;
      }

      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: environment.googleClientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
          if (tokenResponse?.error) {
            reject(new Error(tokenResponse.error));
            return;
          }
          this.accessToken = tokenResponse.access_token;
          // Clear cached token after ~58 minutes (tokens expire in 60)
          setTimeout(() => { this.accessToken = null; }, 3_480_000);
          resolve(this.accessToken!);
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message ?? 'OAuth failed'));
        }
      });

      // '' = silent if already consented, 'consent' = always show screen
      this.tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  /** Open the Drive Picker and resolve with the chosen file (or null if cancelled) */
  openPicker(mimeTypes = '*/*'): Promise<DriveFile | null> {
    return this.loadGapi()
      .then(() => this.getToken())
      .then((token) => new Promise<DriveFile | null>((resolve, reject) => {
        try {
          const view = new google.picker.DocsView()
            .setIncludeFolders(false)
            .setSelectFolderEnabled(false);

          if (mimeTypes !== '*/*') {
            view.setMimeTypes(mimeTypes);
          }

          const pickerBuilder = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token)
            .setDeveloperKey(environment.googleApiKey)
            .setAppId(environment.googleProjectNumber)
            .setCallback((data: any) => {
              if (data.action === google.picker.Action.PICKED) {
                const doc = data.docs[0];
                resolve({
                  id: doc.id,
                  name: doc.name,
                  mimeType: doc.mimeType,
                  url: `https://drive.google.com/uc?export=download&id=${doc.id}`,
                  sizeBytes: doc.sizeBytes,
                });
              } else if (data.action === google.picker.Action.CANCEL) {
                resolve(null);
              }
            });

          pickerBuilder.build().setVisible(true);
        } catch (e) {
          reject(e);
        }
      }));
  }
}
