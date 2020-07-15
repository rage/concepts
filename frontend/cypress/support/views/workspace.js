Cypress.Commands.add("workspaceListContains", (item, contains) => {
    if (contains) {
        cy.contains('.MuiListItem-root', item)
    } else {
        cy.contains('.MuiListItem-root', item).should('not.exist')
    }
})

Cypress.Commands.add("createWorkspace", name => {
    cy.get('.MuiCardHeader-action > .MuiButtonBase-root').click()
    cy.get('.MuiInputBase-input').type(name)
    cy.get('.MuiDialogActions-root > :nth-child(4)').click()
})