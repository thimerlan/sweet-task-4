import { useEffect, useState } from "react";
import { auth, usersDB } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { format } from "date-fns";
import { onValue, ref, update } from "firebase/database";
import Table from "./Table/Table";
import NavBar from "./NavBar/NavBar";

function App() {
  const [user] = useAuthState(auth);
  const [usersList, setUsersList] = useState<Record<string, IUserProfile>>({});

  useEffect(() => {
    const userRef = ref(usersDB, `usersList`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (user) {
        const usersData: Record<string, IUserProfile> = snapshot.val();
        if (usersData) {
          setUsersList(usersData);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (user && usersList) {
      const lastSignInTime = user.metadata?.lastSignInTime;
      const registrationTime = user.metadata?.creationTime;
      const formattedSignInTime = lastSignInTime
        ? format(new Date(lastSignInTime), "HH:mm:ss, d MMM, yyyy")
        : null;
      const formattedRegistrationTime = registrationTime
        ? format(new Date(registrationTime), "HH:mm:ss, d MMM, yyyy")
        : null;

      const usersProfileRef = ref(usersDB, `usersList/${user.uid}`);
      if (formattedRegistrationTime && formattedSignInTime) {
        update(usersProfileRef, {
          registrationTime: formattedRegistrationTime,
          lastSignInTime: formattedSignInTime,
        });
      }
    }
  }, [user, usersList]);

  const usersListData = Object.values(usersList);

  const currentUserProfile = Object.values(usersListData).find(
    (user) => user?.uid === auth.currentUser?.uid
  );

  return (
    <main>
      <NavBar usersListData={usersListData} />
      {user && currentUserProfile?.status === "active" && (
        <Table usersListData={usersListData} />
      )}
    </main>
  );
}

export default App;
