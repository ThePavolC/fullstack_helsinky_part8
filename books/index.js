require("dotenv").config();

const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const { v1: uuid } = require("uuid");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const MONGODB_URI = process.env.MONGODB_URI;

const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = gql`
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    authorCount: Int!
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]!
    ): Book
    addAuthor(name: String!, born: Int): Author
    editAuthor(name: String, setBornTo: Int): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      let query = Book.find({}).populate("author", { name: 1, born: 1 });

      if (args.author) {
        const author = await Author.find({ name: args.author });
        query = query.find({ author });
      }
      if (args.genre && args.genre !== 'all genres') {
        query = query.find({ genres: { $in: args.genre } });
      }

      return query;
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    bookCount: async (root) => {
      const author = await Author.find({ name: root.name });
      return Book.find({ author }).countDocuments();
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let newBook;

      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      try {
        let author;
        author = await Author.findOne({ name: args.author });

        if (!author) {
          const _author = new Author({ name: args.author });
          author = await _author.save();
        }

        const book = new Book({ ...args, author: author });

        newBook = await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })

      return newBook;
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args });

      let newAuthor;
      try {
        newAuthor = await author.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return newAuthor;
    },
    editAuthor: async (root, args, context) => {
      const { name, setBornTo } = args;

      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const author = await Author.findOneAndUpdate(
        { name: name },
        { born: setBornTo },
        { returnNewDocument: true }
      );
      return author;
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "pass") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
