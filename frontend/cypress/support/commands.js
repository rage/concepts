Cypress.Commands.add("login", (username, password) => {
    cy.get(':nth-child(1) > .MuiInputBase-root > .MuiInputBase-input')
        .type(username)
        .should('have.value', username)
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputBase-input')
        .type(password)
        .should('have.value', password)

    cy.get('.MuiButtonBase-root').click()
})

Cypress.Commands.add("workspaceListContains", (item) => {
    cy.get('.MuiListItem-root').contains(item)
})

Cypress.Commands.add("createWorkspace", (name) => {
    cy.get('.MuiCardHeader-action > .MuiButtonBase-root').click()
    cy.get('.MuiInputBase-input').type(name)
    cy.get('.MuiDialogActions-root > :nth-child(4)').click()
})