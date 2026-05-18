

import 'bootstrap/dist/css/bootstrap.min.css';

import { useContext, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import AnswersDisplay from './components/AnswersDisplay.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { QuestionsList } from './components/QuestionDisplay.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';

import UserContext from './contexts/UserContext.js';

import { getQuestions } from './api/api.js';
import { checkSession } from './api/auth.js';

function App() {

  const navigate = useNavigate()


  // STATE AND HANDLERS RELATED TO QUESTION LIST

  const [questions, setQuestions] = useState([])

  // read the full list of questions at application startup (when App mounts)
  useEffect(() => {
    async function getQuestionList() {
      try {
        const list_of_questions = await getQuestions()
        setQuestions(list_of_questions)
      } catch (ex) {
        // navigate away, and/or write a message , ...
        navigate('/error')
      }
    }
    getQuestionList()
  }, [])


  // STATE AND HANDLERS RELATED TO CURRENTLY LOGGED USER

  // Currently logged-in user
  const [user, setUser] = useState({ id: undefined, email: undefined, name: undefined })

  // try to restore the login session
  useEffect(() => {
    checkSession().then(result => {
      if (result) {
        setUser({ id: result.id, email: result.username, name: result.name })
      }
    })
  }, [])

  // Login action handler
  const doLogin = (newUser) => {
    setUser({ id: newUser.id, email: newUser.username, name: newUser.name })
    navigate('/home')
  }

  return (
    <UserContext.Provider value={user}>
      <Container>
        <Routes>
          <Route path='/' element={<MainLayout doLogin={doLogin} />}>
            <Route index element={<LoginView />} />
            <Route path='home' element={<HomeView questions={questions} />} />
            <Route path='answers/:questionId' element={<AnswersDisplay />} />
            {/* <Route path='answers/:questionId/new' element={<AddAnswerForm/>}/> */}
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
            <Route path='error' element={<h1>"Something is Wrong"</h1>} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  )
}

function MainLayout(props) {
  return <>
    <Header doLogin={props.doLogin}></Header>
    <Outlet />
    <Footer></Footer>
  </>
}

function LoginView(props) {

  // if user.id is not undefined, navigate to /home
  const user = useContext(UserContext)
  if (user.id)
    return <Navigate to='/home' />

  return "Login View : main welcome page for anonymous users"
}

function HomeView(props) {

  // if user.id is not defined, navigate to /
  const user = useContext(UserContext)

  // if you want to navigate "away", just render a Navigate component
  if (!user.id)
    return <Navigate to='/' />

  // otherwise render normal page content
  return <QuestionsList questions={props.questions} />
}


export default App
