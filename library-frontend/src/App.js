import React, { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import LoginForm from "./components/LoginForm";
import NewBook from "./components/NewBook";

import { useApolloClient } from '@apollo/client';

const App = () => {
  const [page, setPage] = useState("authors");
  const [error, setError] = useState();
  const [token, setToken] = useState(null)

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token'))
  }, []);

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage("login")
  }

  return (
    <div>
      {error && <div>{error}</div>}
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => logout()}>log out</button>}
        {!token && <button onClick={() => setPage("login")}>log in</button>}
      </div>

      <Authors show={page === "authors"} setError={setError} token={token} />

      <Books show={page === "books"} setError={setError} />

      {token && <NewBook show={page === "add"} setError={setError} />}
      <LoginForm show={page === "login"} setToken={setToken} setError={setError} setPage={setPage}/>
    </div>
  );
};

export default App;
