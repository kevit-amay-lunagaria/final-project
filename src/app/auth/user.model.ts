export class User {
  public userFirstName: string;
  public userLastName: string;
  public userEmail: string;
  public userPassword: string;

  constructor(fname: string, lname: string, email: string, password: string) {
    this.userFirstName = fname;
    this.userLastName = lname;
    this.userEmail = email;
    this.userPassword = password;
  }
}
