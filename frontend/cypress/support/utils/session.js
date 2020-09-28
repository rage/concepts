let currentUser = null;

Cypress.Commands.add("saveSession", () => {
    if (localStorage['currentUser']) {
        currentUser = localStorage['currentUser']
    }
})

Cypress.Commands.add("restoreSession", () => {
    if (currentUser) {
        localStorage['currentUser'] = currentUser
    }
})

beforeEach(() => {
    cy.restoreSession()
})

afterEach(() => {
    cy.saveSession()
})