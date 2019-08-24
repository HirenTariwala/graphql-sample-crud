const graphql = require('graphql'); // This module give access of entire graphql request structure
const axios = require('axios'); // This module help us to call 3rd party query

// destructure diff type available in graphql
const {
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} = graphql;

// created company schema with fields
const CompanyType = new GraphQLObjectType({
   name: 'Company',
   fields: () => ({
       id: { type: GraphQLInt },
       name: { type: GraphQLString },
       users: {
           type: new GraphQLList(UserType),
           resolve(companyDetails, args) {
               return axios.get(`http://localhost:3000/companies/${companyDetails.id}/users`)
                   .then(users => users.data);
           }
       }
   })
});

// created user schema with fields
const UserType = new GraphQLObjectType({
    name: 'User', // gave name of schema
    fields: () => ({ // add all fields assoc with UserType
        id: { type: GraphQLInt },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(userDetails, args) {
                return axios.get(`http://localhost:3000/companies/${userDetails.companyId}`)
                    .then(company => company.data);
            }
        }
    })
});

// create root query schema

/*
    Ex. query
    {
      user(id: 2) {
        age,
        firstName
       }
    }
*/

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', // gave name of schema
    fields: {
        // assign field as user with build UserType above
        user: {
            type: UserType,
            args: { id: { type: GraphQLInt } },
            /**
             *
             * @param parentValue not in use
             * @param args with all args which provide as above args
             * @returns user object which match with given id as args
             */
            resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/users/${args.id}`)
                   .then(user => user.data);
            }
       },
       company: {
           type: CompanyType,
           args: { id: { type: GraphQLInt } },
           /**
            *
            * @param parentValue not in use
            * @param args with all args which provide as above args
            * @returns company object which match with given id as args
            */
           resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/companies/${args.id}`)
                   .then(company => company.data);
           }
       }
    }
});

// create mutation to add, delete and update user or company
/*
Ex.

mutation {
  addUser(firstName: "Test", age: 23, companyId: 1) {
    id,
    firstName,
    age
  }
}

mutation {
  updateUser(id: 4, firstName: "Test1", age: 24, companyId: 2) {
    id,
    firstName,
    age
  }
}

mutation {
  deleteUser(id: 5) {
    id,
    firstName,
    age
  }
}

*/
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parentValues, args) {
                return axios.post('http://localhost:3000/users', {...args})
                    .then(user => user.data);
            }
        },
        /*  Not all fields require always only Id need always we can pass fields which want to update
            using patch we can archive this
        * */
        updateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt) },
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parentValues, args) {
                return axios.put(`http://localhost:3000/users/${args.id}`, {...args})
                    .then(user => user.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve(parentValues, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(user => user.data);
            }
        }

    }
});

// export entire graphaql schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});