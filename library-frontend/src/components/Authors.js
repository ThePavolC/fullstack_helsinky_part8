import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";

import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    if (!result.loading) {
      setAuthors(result.data.allAuthors);
    }
  }, [result]);

  if (!props.show) {
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
      <>
        <h3>Set birthyear</h3>
        <AuthorBirthYearForm authors={authors} />
      </>
    </div>
  );
};

const AuthorBirthYearForm = ({ authors }) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthor({
      variables: { name, year: parseInt(year) },
    });

    setName("");
    setYear("");
  };

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
