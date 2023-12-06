const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
                return userData;
            }
            throw new AuthenticationError('Please log in!');
        },
    },

    Mutation: {
        addUser: async (parent, { name, email, password }) => {
            const user = await User.create({ name, email, password });
            const token = signToken(user);

            return { token, profile };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!profile) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const userProfile = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: newBook }},
                    { new: true }
                )
                return userProfile;
            }
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const userProfile = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId }}},
                    { new: true }
                )
                return userProfile;
            }
            
        }
    }
}

module.exports = resolvers;