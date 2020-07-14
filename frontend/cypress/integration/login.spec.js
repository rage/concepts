describe('Visit concepts', () => {
    it("login button navigates to login form", () => {
        cy.visit('http://localhost:8080')
        cy.get(':nth-child(1) > .MuiButtonBase-root').click()
        cy.url().should('include', '/login')
    })

    it("wrong username and password", () => {
        cy.login("wrong user", "wrong pass")
        cy.url().should('include', '/login')
        cy.get('.MuiFormHelperText-root').contains("Invalid")
    })
})