import TaskListStyle from "./TaskListStyle";
import { useEffect, useRef, useState } from "react";
import TaskListRows from "../task-list-rows/TaskListRows";
import TaskListCells from "../task-list-cells/TaskListCells";
import { Button, TextField } from "@mui/material";
import User from "../../../../utils/interfaces/InterfaceUser";
import Note from "../../../../utils/interfaces/InterfaceNote";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { selectAll as selectAllUsers, updateUser } from "../../../../store/modules/user/UserSlice";
import { addNote, removeNote, selectAll as selectAllNotes, updateNote} from "../../../../store/modules/user/NoteSlice";


export default function NoteList(): JSX.Element {
  const [loggedUser, setLoggedUser] = useState<User | null>();
  const [notes, setNotes] = useState<Note[]>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const titleRef = useRef();
  const descriptionRef = useRef();

  const dispatch = useAppDispatch();
  const userList = useAppSelector(selectAllUsers);
  const noteList = useAppSelector(selectAllNotes)

  useEffect(() => {
    setLoggedUser(ReturnUserData());
  }, []);
  useEffect(() => {
    setNotes(loggedUser?.notes);
  }, [loggedUser]);

  useEffect(() => {
    const recadosUsuarios = noteList.filter(
      (note:any) => note.userEmail === loggedUser?.email
    );
    setNotes(recadosUsuarios);
  }, [noteList, loggedUser]);

  function ReturnUserData(){
    const logged = sessionStorage.getItem('logged');
    const loggedUser = userList.find(
        (valor:User) => valor.email === logged
    )
    if(loggedUser){
        return loggedUser
    } 
    return null
}

  function saveNote(): void {
    const newNote: Note = {
      uid: uuidv4(),
      description: description,
      title: title,
      userEmail: loggedUser!.email,
    };

    if (!description || !title) {
      alert("Necessário digitar alguma informação");
      return;
    }
    dispatch(addNote(newNote));
  }

  function editThisNote(uid: string) {
    const inputTitle = document.getElementById(uid + "1");
    const inputDescription = document.getElementById(uid + "2");
    const editButton = document.getElementById(uid + "3");
    if (editButton!.innerText === "EDITAR") {
      editButton!.innerText = "SALVAR";
      inputTitle?.removeAttribute("readonly");
      inputTitle?.classList.remove("MuiInputBase-readOnly");
      inputDescription?.removeAttribute("readonly");
      inputDescription?.classList.remove("MuiInputBase-readOnly");
      inputTitle?.focus();
    } else {
      editButton!.innerText = "EDITAR";
      inputDescription?.setAttribute("readonly", "readonly");
      inputDescription?.classList.add("MuiInputBase-readOnly");
      inputTitle?.setAttribute("readonly", "readonly");
      inputTitle?.classList.add("MuiInputBase-readOnly");
      //@ts-ignore
      const newTitle = inputTitle.value;
      //@ts-ignore
      const newDescription = inputDescription.value;
      dispatch(updateNote({id: uid, changes: {title: newTitle, description: newDescription}}))
    }
  }

  return (
    <TaskListStyle>
      <TaskListRows>
        <TaskListCells>
          <TextField
            id="standard-basic"
            label="Tarefa"
            variant="standard"
            fullWidth={true}
            onChange={(e) => setTitle(e.target.value)}
            inputRef={titleRef}
          />
        </TaskListCells>
        <TaskListCells>
          <TextField
            id="standard-basic"
            label="Descrição"
            variant="standard"
            fullWidth={true}
            onChange={(e) => setDescription(e.target.value)}
            inputRef={descriptionRef}
          />
        </TaskListCells>
        <TaskListCells>
          <div className="task-list-actions-header">
            <Button
              onClick={(e) => {
                e.preventDefault();
                saveNote();
                // @ts-ignore
                titleRef.current.value = "";
                // @ts-ignore
                descriptionRef.current.value = "";
              }}
              variant="contained"
              fullWidth={true}
            >
              Salvar
            </Button>
          </div>
        </TaskListCells>
      </TaskListRows>
      {notes?.map((value) => (
        <TaskListRows id={value.uid} key={value.uid}>
          <TaskListCells>
            <TextField
              id={value.uid + "1"}
              label="Tarefa"
              variant="standard"
              fullWidth={true}
              className="task-list-title"
              defaultValue={value.title}
              InputProps={{
                readOnly: true,
              }}
            />
          </TaskListCells>
          <TaskListCells>
            <TextField
              id={value.uid + "2"}
              label="Tarefa"
              variant="standard"
              fullWidth={true}
              className="task-list-description"
              defaultValue={value.description}
              InputProps={{
                readOnly: true,
              }}
            />
          </TaskListCells>
          <TaskListCells>
            <div className="task-list-actions">
              <Button
                id={value.uid + "3"}
                variant="outlined"
                fullWidth={true}
                onClick={(e) => {
                  e.preventDefault();
                  editThisNote(value.uid);
                }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                fullWidth={true}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(removeNote(value.uid));
                }}
              >
                Excluir
              </Button>
            </div>
          </TaskListCells>
        </TaskListRows>
      ))}
    </TaskListStyle>
  );
}