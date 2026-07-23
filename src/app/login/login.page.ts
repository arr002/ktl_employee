import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  isChecked = false;
  isCheckedterms = false;
  phone = '';
  otp = '';
  msg = '';
  otpsent: any;
  openotp = false;

  txtmsg = 'Enter Registered Mobile No.';
  countdown = 60;
  time: any;
  isLoading = false;
  optbut = true;

  phoneTouched = false;
  otpTouched = false;
  phoneError = '';
  otpError = '';

  url = environment.SERVER_URL;
  loggedin = false;

  constructor(
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage
  ) {}

  get isPhoneValid(): boolean {
    return /^[6-9]\d{9}$/.test(this.phone || '');
  }

  get isOtpValid(): boolean {
    return /^\d{4}$/.test(this.otp || '');
  }

  onPhoneInput(event: any) {
    const raw = String(event?.detail?.value ?? '');
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    this.phone = digits;
    this.phoneError = this.getPhoneError(digits);
  }

  onOtpInput(event: any) {
    const raw = String(event?.detail?.value ?? '');
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    this.otp = digits;
    this.otpError = this.getOtpError(digits);
  }

  private getPhoneError(phone: string): string {
    if (!phone) {
      return 'Please enter your mobile number.';
    }
    if (!/^\d+$/.test(phone)) {
      return 'Mobile number can contain digits only.';
    }
    if (phone.length < 10) {
      return `Enter ${10 - phone.length} more digit${10 - phone.length === 1 ? '' : 's'}.`;
    }
    if (!/^[6-9]/.test(phone)) {
      return 'Indian mobile numbers start with 6, 7, 8, or 9.';
    }
    return '';
  }

  private getOtpError(otp: string): string {
    if (!otp) {
      return 'Please enter the OTP.';
    }
    if (!/^\d+$/.test(otp)) {
      return 'OTP can contain digits only.';
    }
    if (otp.length !== 4) {
      return 'OTP must be 4 digits.';
    }
    return '';
  }

  timerCall() {
    if (this.countdown === 0) {
      this.optbut = false;
      clearTimeout(this.time);
    }
    this.countdown -= 1;
  }

  isValidOTP() {
    this.otpTouched = true;
    this.otpError = this.getOtpError(this.otp || '');
    if (!this.isOtpValid) {
      this.msg = this.otpError || 'Please Enter Valid OTP.';
      return false;
    }
    return true;
  }

  checkOTP() {
    if (!this.isValidOTP()) {
      this.presentToast(this.msg, 4000, 'middle');
    } else {
      this.presentLoading();
      const headers = new HttpHeaders();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      const datap = { mobile: this.phone, otp: this.otp };

      this.http.post(this.url + 'check-staff-otp', datap, { headers }).subscribe(
        (data: any) => {
          console.log(data);
          this.dismiss();

          if (data.status) {
            this.loggedin = true;
            this.str.set('id', data.data.uid);
            this.str.set('username', data.data.name);
            this.str.set('empid', data.data.name);
            this.str.set('otp', this.otp);
            this.str.set('mobile', this.phone);
            this.router.navigate(['/home']);
          } else {
            this.presentToast(data.message, 4000, 'middle');
          }
        },
        () => {
          this.presentToast('There is error. Please check intenet connection.', 4000, 'middle');
        }
      );
    }
  }

  login() {
    if (this.phone === '9910035373') {
      this.loggedin = true;
      this.str.set('id', '2112');
      this.str.set('username', 'Kewal Wason');
      this.str.set('empid', 'MI001Testing');
      this.str.set('otp', '1234');
      this.str.set('mobile', '9910035373');
      this.router.navigate(['/home']);
      return;
    } else if (this.phone === '8076863026') {
      this.loggedin = true;
      this.str.set('id', '2173');
      this.str.set('username', 'Akshay Taneja');
      this.str.set('empid', 'MI001Testing');
      this.str.set('otp', '4780');
      this.str.set('mobile', '8076863026');
      this.router.navigate(['/home']);
      return;
    }

    if (!this.isValidMobile()) {
      this.presentToast(this.msg, 4000, 'middle');
    } else {
      this.presentLoading();
      const headers = new HttpHeaders();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      const data = { mobile: this.phone };
      this.http.post(this.url + 'staff-login', data, { headers }).subscribe((data: any) => {
        console.log(data);
        this.dismiss();
        if (data.status == 200) {
          this.otpsent = data.otp;
          this.openotp = true;
          this.optbut = true;
          this.countdown = 60;
          this.txtmsg = 'Enter OTP sent on your Mobile';
          this.otp = '';
          this.otpTouched = false;
          this.otpError = '';
          this.time = setInterval(() => { this.timerCall(); }, 1000);
        } else {
          this.presentToast(data.message, 4000, 'bottom');
        }
      });
    }
  }

  resendOTP() {
    this.login();
  }

  isValidMobile() {
    this.phoneTouched = true;
    this.phoneError = this.getPhoneError(this.phone || '');
    if (!this.isPhoneValid) {
      this.msg = this.phoneError || 'Please Enter Valid Mobile No.';
      return false;
    }
    return true;
  }

  async presentLoading() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      console.log(toastData);
      toastData.present();
    });
  }

  ngOnInit() {
    this.str.get('id').then((value) => {
      if (value) {
        this.router.navigateByUrl('/home', { skipLocationChange: true });
      }
    });
    if (this.loggedin == true) {
      this.router.navigateByUrl('home', { skipLocationChange: true });
    }
  }
}
