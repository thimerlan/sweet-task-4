import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, usersDB } from "../../firebaseConfig";
import { ref, remove } from "firebase/database";
import AuthForm from "../Auth/AuthForm/AuthForm";
import "./NavBar.scss";

interface INavBarProps {
  usersListData: IUserProfile[];
}

const NavBar = ({ usersListData }: INavBarProps) => {
  const [user] = useAuthState(auth);

  const [showSignInForm, setShowSignInForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const handleSignInClick = () => {
    setShowSignInForm(true);
    setShowSignUpForm(false);
  };

  const handleSignUpClick = () => {
    setShowSignUpForm(true);
    setShowSignInForm(false);
  };
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (): Promise<void> => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await user?.delete();

        console.log("User is deleted");

        await cleanupUserDatabase();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };
  const cleanupUserDatabase = async () => {
    try {
      if (user) {
        const userRef = ref(usersDB, `usersList/${user.uid}`);

        await remove(userRef);

        console.log("User data deleted from the database");
      }
    } catch (error) {
      console.log("Error deleting user data from the database:", error);
    }
  };

  const currentUserProfile = Object.values(usersListData).find(
    (user) => user?.uid === auth.currentUser?.uid
  );

  return (
    <header>
      <nav className="nav-bar">
        <div className="nav__container">
          {!user && (
            <p className="signInUp-info ">
              Please sign in or up to see all features!
            </p>
          )}
          {user && (
            <h3 className="user-name">
              Hello, <span>{currentUserProfile?.userName}</span>
            </h3>
          )}
          {user && currentUserProfile?.status === "blocked" && (
            <p className="blocked-userInfo">
              We regret to inform you that your account has been blocked. As a
              result, you are currently unable to access our website using this
              account. However, you have the option to sign up again with a
              different account. We apologize for any inconvenience this may
              cause and thank you for your understanding.
            </p>
          )}
          {(!user || currentUserProfile?.status === "blocked") && (
            <div className="signUPIN-buttons">
              <button onClick={handleSignInClick}>Sign in</button>
              <button onClick={handleSignUpClick}>Sign up</button>
            </div>
          )}

          {user && currentUserProfile?.status === "active" && (
            <div className="logout-buttons">
              <button onClick={handleSignOut}>sign out</button>
              <button onClick={deleteUser}>DELETE</button>
            </div>
          )}
          {showSignInForm && (
            <AuthForm
              formType="signIn"
              setShowSignInForm={setShowSignInForm}
              setShowSignUpForm={setShowSignUpForm}
            />
          )}
          {showSignUpForm && (
            <AuthForm
              formType="signUp"
              setShowSignUpForm={setShowSignUpForm}
              setShowSignInForm={setShowSignInForm}
            />
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
