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
        cy.workspaceListContains("guestWorkspace")
    })
})