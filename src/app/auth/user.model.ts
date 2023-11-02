export class User {
  public userFirstName: string;
  public userLastName: string;
  public userRole: string;
  public userEmail: string;
  public userPassword: string;

  constructor(
    fname: string,
    lname: string,
    role: string,
    email: string,
    password: string
  ) {
    this.userFirstName = fname;
    this.userLastName = lname;
    this.userRole = role;
    this.userEmail = email;
    this.userPassword = password;
  }
}
