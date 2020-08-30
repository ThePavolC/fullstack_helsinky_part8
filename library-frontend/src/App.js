import React, { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

const App = () => {
  const [page, setPage] = useState("authors");
  const [error, setError] = useState();

  return (
    <div>
      {error && <div>{error}</div>}
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>

      <Authors show={page === "authors"} setError={setError} />

      <Books show={page === "books"} setError={setError} />

      <NewBook show={page === "add"} setError={setError} />
    </div>
  );
};

export default App;
