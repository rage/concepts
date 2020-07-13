Cypress.Commands.add("login", (username, password) => {
    cy.get(':nth-child(1) > .MuiInputBase-root > .MuiInputBase-input')
        .type(username)
        .should('have.value', username)
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputBase-input')
        .type(password)
        .should('have.value', password)

    cy.get('.MuiButtonBase-root').click()
})