describe('As a guest I can', () => {
    it("create an account", () => {
        cy.visit('http://localhost:8080')
        // Create guest account by clicking the button
        cy.get(':nth-child(2) > .MuiButtonBase-root').click()
        // Home should be available
        cy.get('.MuiTypography-h6 > .MuiTypography-root').contains("Home")
    })
    
    it("have a mock template", () => {
        cy.listContains("Mock template")
    })

    it("create a workspace", () => {
        cy.createWorkspace('guestWorkspace')
        cy.listContains("guestWorkspace", true)
    })

    it("can remove a workspace", () => {
        cy.get(':nth-child(2) > .MuiListItemSecondaryAction-root > .MuiButtonBase-root').click()
        cy.get('[aria-label="Delete"]').click()
        cy.get('.MuiButton-textSecondary').click()
        cy.listContains("guestWorkspace", false)
    })

    it("can rename workspace", () => {
        // Rename mock template
        cy.get(':nth-child(1) > .MuiListItemSecondaryAction-root > .MuiButtonBase-root').click()
        cy.get('[aria-label="Edit"]').click()
        cy.get('.MuiInputBase-input').type("2")
        cy.get('[type="submit"] > .MuiButton-label').click()
        cy.listContains("Mock template2", true)
    })

    it("can open workspace", () => {
        cy.get('.MuiListItem-root').click()
        cy.get(':nth-child(1) > .MuiButton-root').click()
        cy.get('.makeStyles-header-658').should('have.text', 'Workspace: Mock template2')
    })

    it("can create a course", () => {
        cy.get('[style="margin-bottom: 4px;"] > .MuiInputBase-root > .MuiInputBase-input').type("Test course")
        cy.get('.makeStyles-form-835 > :nth-child(2) > .MuiInputBase-root').type("Description")
        cy.get('.makeStyles-form-835 > .MuiButtonBase-root').click()
        cy.listContains("Test course", true)
    })

    it("select course and create objective", () => {
        cy.get(':nth-child(5) > .MuiListItem-root').click()
        cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type("objective 1")
        cy.get('.makeStyles-concepts-661 > .MuiCard-root > .makeStyles-form-835 > .makeStyles-textfield-832 > .MuiInputBase-root > .MuiInputBase-input').type("description")
        cy.get('.makeStyles-concepts-661 > .MuiCard-root > .makeStyles-form-835 > .MuiButtonBase-root').click()
        cy.listContains("objective 1", true)
    })
})