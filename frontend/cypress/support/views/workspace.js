Cypress.Commands.add("workspaceListContains", item => {
    cy.contains('.MuiListItem-root', item)
})

Cypress.Commands.add("createWorkspace", name => {
    cy.get('.MuiCardHeader-action > .MuiButtonBase-root').click()
    cy.get('.MuiInputBase-input').type(name)
    cy.get('.MuiDialogActions-root > :nth-child(4)').click()
})