import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";

import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const Authors = ({ token, show, setError }) => {
  const result = useQuery(ALL_AUTHORS);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    if (!result.loading) {
      setAuthors(result.data.allAuthors);
    }
  }, [result]);

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token &&
      <div>
        <h3>Set birthyear</h3>
        <AuthorBirthYearForm authors={authors} setError={setError} />
      </div>}
    </div>
  );
};

const AuthorBirthYearForm = ({ authors, setError }) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onCompleted: () => {
      setError(null);
    },
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthor({
      variables: { name, year: parseInt(year) },
    });

    setName("");
    setYear("");
  };

  useEffect(() => {
    // set first value as a
    if (authors.length > 0) {
      setName(authors[0].name);
    }
  }, [authors]);

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
