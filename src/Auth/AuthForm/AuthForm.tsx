import { ChangeEvent, useState } from "react";

import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { usersDB } from "../../../firebaseConfig";
import { child, get, ref, set } from "firebase/database";

import "./AuthForm.scss";

interface IAuthFormProps {
  formType: string;
  setShowSignInForm: (value: boolean) => void;
  setShowSignUpForm: (value: boolean) => void;
}

const AuthForm = ({
  formType,
  setShowSignInForm,
  setShowSignUpForm,
}: IAuthFormProps) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isSubmitButtonDisabled = (): boolean => {
    if (formType === "signUp") {
      return !userName || !email || !password;
    }
    if (formType === "signIn") {
      return !email || !password;
    }
    return true;
  };

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowSignInForm(false);
      console.log("User signed in successfully");
    } catch (error: any) {
      console.log((error as AuthError).message);
      setError((error as AuthError).message);
    }
  };

  const handleSignUp = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      createUserProfile();
      setShowSignUpForm(false);

      console.log("User registered successfully");
    } catch (error: any) {
      console.log((error as AuthError).message);
      setError((error as AuthError).message);
    }
  };

  const createUserProfile = async (): Promise<void> => {
    const userUID = auth.currentUser?.uid;

    if (userUID) {
      const usersListRef = ref(usersDB, "usersList");

      const userProfileSnapshot = await get(child(usersListRef, userUID));
      if (!userProfileSnapshot.exists()) {
        const userProfileData: IUserProfile = {
          uid: userUID,
          userName: userName,
          userEmail: email,
          lastSignInTime: "",
          registrationTime: "",
          status: "active",
        };

        await set(child(usersListRef, userUID), userProfileData);
      }
    }
  };

  return (
    <>
      {formType === "signIn" && (
        <div className="auth__form signIn-form">
          <div className="auth__form-container">
            <div className="close-authForm">
              <button onClick={() => setShowSignInForm(false)}>&#10008;</button>
            </div>
            <form onSubmit={(e) => handleSignIn(e)}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Email"
              />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
              />
              {error.length !== 0 && <p className="authForm-error">{error}</p>}
              <button disabled={isSubmitButtonDisabled()} type="submit">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {formType === "signUp" && (
        <div className="auth__form signUp-form">
          <div className="auth__form-container">
            <div className="close-authForm">
              <button onClick={() => setShowSignUpForm(false)}>X</button>
            </div>
            <form onSubmit={(e) => handleSignUp(e)}>
              <input
                type="text"
                name="username"
                maxLength={15}
                value={userName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUserName(e.target.value)
                }
                placeholder="User Name:"
              />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Email:"
              />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Password:"
              />
              {error ? <p className="authForm-error">{error}</p> : ""}
              <button disabled={isSubmitButtonDisabled()} type="submit">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthForm;
