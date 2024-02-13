import { useState } from "react";
import { ref, update } from "firebase/database";
import { MdLock, MdLockOpen } from "react-icons/md";
import { usersDB } from "../../firebaseConfig";
import "./Table.scss";

interface ITableProps {
  usersListData: IUserProfile[];
}

const Table = ({ usersListData }: ITableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allUserIds = usersListData.map((user) => user.uid);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBlockUser = async (): Promise<void> => {
    try {
      await Promise.all(
        selectedUsers.map(async (userUID) => {
          const usersProfileRef = ref(usersDB, `usersList/${userUID}`);
          await update(usersProfileRef, {
            status: "blocked",
          });
        })
      );

      setSelectedUsers([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleUnBlockUser = async (): Promise<void> => {
    try {
      await Promise.all(
        selectedUsers.map(async (userUID) => {
          const usersProfileRef = ref(usersDB, `usersList/${userUID}`);
          await update(usersProfileRef, {
            status: "active",
          });
        })
      );

      setSelectedUsers([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  return (
    <div className="table-container">
      <div className="toolbar">
        <button
          disabled={selectedUsers.length === 0}
          onClick={handleBlockUser}
          title="Block"
        >
          <MdLock />
        </button>
        <button
          disabled={selectedUsers.length === 0}
          onClick={handleUnBlockUser}
          title="Unblock"
        >
          <MdLockOpen />
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Last Login Time</th>
            <th>Registration Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {usersListData.map((row, index) => (
            <tr
              key={row.uid}
              className={`${
                row.status === "active"
                  ? "userIsActive"
                  : row.status === "blocked"
                  ? "userIsBlocked"
                  : ""
              } ${index % 2 === 0 ? "even-row" : "odd-row"}`}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(row.uid)}
                  onChange={() => handleSelectUser(row.uid)}
                />
              </td>
              <td>{index + 1}</td>
              <td>{row.userName}</td>
              <td>{row.userEmail}</td>
              <td>{row.lastSignInTime}</td>
              <td>{row.registrationTime}</td>
              <td
                className={
                  row.status === "active"
                    ? "status-active"
                    : row.status === "blocked"
                    ? "status-blocked"
                    : ""
                }
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
