import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import { ALL_BOOKS } from "../queries";

const ALL_GENRES = "all genres"

const GenreButton = ({genre, setSelectedGenre}) => {
  const onGenreClick = (e) => {
    setSelectedGenre(genre)
  }

  return <button onClick={onGenreClick}>{genre}</button>;
}

const Books = (props) => {
  const [books, setBooks] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES);
  const result = useQuery(ALL_BOOKS, {variables: {genre: selectedGenre}});

  useEffect(() => {
    if (!result.loading) {
      setBooks(result.data.allBooks);
      if (allGenres.every(g => g === ALL_GENRES)) {
        const genres = new Set();
        books.map(book => book.genres.map(genre => genres.add(genre)))
        setAllGenres([...genres])
      }
    }
  }, [allGenres, books, result]);

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>

      {selectedGenre && <>selected genre <b>{selectedGenre}</b></>}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
          <tr>
            <td>
              {allGenres &&
              allGenres.map(
                genre => <GenreButton key={genre} genre={genre} setSelectedGenre={setSelectedGenre}/>
                )
              }
              <GenreButton key="all" genre={ALL_GENRES} setSelectedGenre={setSelectedGenre}/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Books;
