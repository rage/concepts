describe('As a guest I can', () => {
    it("create an account", () => {
        cy.visit('http://localhost:8080')
        // Create guest account by clicking the button
        cy.get(':nth-child(2) > .MuiButtonBase-root').click()
        // Home should be available
        cy.get('.MuiTypography-h6 > .MuiTypography-root').contains("Home")
    })
    
    it("have a mock template", () => {
        cy.workspaceListContains("Mock template")
    })

    it("create a workspace", () => {
        cy.createWorkspace('guestWorkspace')
        cy.workspaceListContains("guestWorkspace", true)
    })

    it("can remove a workspace", () => {
        cy.get(':nth-child(2) > .MuiListItemSecondaryAction-root > .MuiButtonBase-root').click()
        cy.get('[aria-label="Delete"]').click()
        cy.get('.MuiButton-textSecondary').click()
        cy.workspaceListContains("guestWorkspace", false)
    })

    it("can rename workspace", () => {
        // Rename mock template
        cy.get(':nth-child(1) > .MuiListItemSecondaryAction-root > .MuiButtonBase-root').click()
        cy.get('[aria-label="Edit"]').click()
        cy.get('.MuiInputBase-input').type("2")
        cy.get('[type="submit"] > .MuiButton-label').click()
        cy.workspaceListContains("Mock template2", true)
    })
})