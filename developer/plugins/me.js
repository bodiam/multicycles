import gql from 'graphql-tag'

export default function(context) {
  if (context.app.$auth.loggedIn) {
    let client = context.app.apolloProvider.defaultClient

    return client
      .query({
        query: gql`
          query {
            me {
              userId
              name
              organization
              email
              picture
              roles
              subscription {
                plan {
                  id
                  name
                  support
                }
                limits
              }
              payementInformation {
                id
                brand
                expMonth
                expYear
                last4
              }
              usage {
                tokens
                unitsPerMonth
              }
            }
          }
        `
      })
      .then(resp => {
        if (resp.data.me) {
          context.store.commit('user', resp.data.me)
        }
      })
      .catch(resp => context.app.$auth.logout())
  }
}
