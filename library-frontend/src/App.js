import React, { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import LoginForm from "./components/LoginForm";
import NewBook from "./components/NewBook";

import {BOOK_ADDED, ALL_BOOKS} from "./queries"
import { useApolloClient, useSubscription } from '@apollo/client';

const App = () => {
  const [page, setPage] = useState("authors");
  const [error, setError] = useState();
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token'))
  }, []);

  const updateCacheWith = (bookAdded) => {
    const includedIn = (set, object) =>
      set.map(p => p.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS, variables: {genre: "all genres"}})
    if (!includedIn(dataInStore.allBooks, bookAdded)) {
      client.writeQuery({
        query: ALL_BOOKS,
        variables: {genre: "all genres"},
        data: { allPersons : dataInStore.allBooks.concat(bookAdded) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const bookAdded = subscriptionData.data.bookAdded
      window.alert('New book has been added');
      updateCacheWith(bookAdded)
    }
  });


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

      {token && <NewBook show={page === "add"} setError={setError} updateCacheWith={updateCacheWith} />}
      <LoginForm show={page === "login"} setToken={setToken} setError={setError} setPage={setPage}/>
    </div>
  );
};

export default App;
