/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Ruchelle Baybayan 
* Student ID: 019315159
* Date: Monday, March 24th 2025
*
********************************************************************************/
const authData = require('./modules/auth-service');
const express = require('express');
const clientSessions = require('client-sessions'); 
const app = express(); 
const projectsContainer = require('./modules/projects'); 
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 

projectsContainer.Initialize()
    .then(authData.initialize)
    .then(function() {
        app.listen(PORT, () => {   
                console.log(`Server is listening on http://localhost:${PORT}`)
        });
    }).catch(function(error) {
        console.log(`Unable to start server" ${error}`); 
    });

    app.use(express.static(__dirname + '/public'));

    /* Middle ware for client sessions  */
    // used to parse URL-encoded form data and make it available in req. body
    app.use(express.urlencoded({ extended: true }));

    app.use(
        clientSessions({
            cookieName: 'session', 
            secret: process.env.SESSION_SECRET, // generated a  random secret using command node -e console.log(require('crypto').randomBytes(32).toString('hex')), 
            duration: 4 * 60 * 1000, // duration of session in ms (4 minutes)
            activeDuration: 1000 * 60, // length of time session will be extended by 
        })
    ); 

    // middleware to make sure all templates will have access to a "session" object
    // important to conditionally show or hide elements to the user (depends if logged in or not)
    app.use((req, res, next) => {
        res.locals.session = req.session; 
        next(); 
    }); 

    // helper middleware function 
    // checks if a user is logged in - will be used in post and category routes 
    // if user not logged in, redirect them back to the login page 
    const ensureLogin = (req, res, next) => {
        if (!req.session.user) { // user not logged in 
            res.redirect('/login'); 
        } else {
            next(); // moves execution to the next middleware function in the req-response cycle 
        }
    }

    app.get('/', (req, res) => {
        res.render('home'); 
    }); 

    app.get('/about', (req, res) => {
        res.render('about'); 
    }); 

    app.get('/solutions/projects', async (req, res) => {
        const sector = req.query.sector; 
        if (sector) {
            const sectorData = await projectsContainer.getProjectsBySector(sector);
            if (!sectorData || sectorData.length === 0) {
                return res.status(404).render("404", { message: "No projects found for a matching sector."}); 
            } 
            return res.render("projects", { projects: sectorData }); 
        } 

        const data = await projectsContainer.getAllProjects();
        if (!data || data.length === 0) {
            return res.status(404).render("404", { message: "No projects found." }); 
        }
        return res.render("projects", {projects: data});
    }); 

    app.get('/solutions/projects/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(404).render("404", { message: "No view matched for a specific route."}); 
        }
        
        const data = await projectsContainer.getProjectById(id);

        if (!data || data.length === 0) {
            res.status(404).render("404", { message: "No projects found for a specific ID." }); 
        } 
        else {
           res.render("project", {title: data.title, project: data});
        }
    }); 

    app.get('/404', async (req, res) => {
        res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." }); 
    });

    app.get('/500', async (req, res) => {
        res.status(404).render("500", { message: "Internal Server Error" }); 
    })

   app.get('/solutions/addProject', ensureLogin, async (req, res) => {
        const sectorData = await projectsContainer.getAllSectors(); 
        res.render("addProject", { sectors: sectorData }); 
   }); 

   app.post('/solutions/addProject', ensureLogin, async(req, res) => {
        try {
            const project = req.body; 
            await projectsContainer.addProject(project); 
            res.redirect('/solutions/projects'); 
        } catch (error) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}`})
        }
        
   }); 

  app.get('/solutions/editProject/:id', ensureLogin, async (req, res) => {
    const { id } = req.params; 
    try {
        const [sectorData, projectWithId] = await Promise.all([
            projectsContainer.getAllSectors(), 
            projectsContainer.getProjectById(id)
        ]);

        console.log(projectWithId); 
        res.render("editProject", { sectors: sectorData, project: projectWithId });
    } catch(error) {
        res.status(404).render("404", { message: error.message }) // if problem obtaining object or collection of sectors 
    }
  }); 

  app.post('/solutions/editProject', ensureLogin, async (req, res) => {
        try {
            const { id } = req.body; 
            const projectData = {...req.body}; 

            await projectsContainer.editProject(id, projectData)
            const updatedProjects = await projectsContainer.getAllProjects()
            res.render("projects", { projects: updatedProjects})
        } catch(error) {
            // dont explicitly set the 500 - errors in vercel 
            console.log(id); 
            res.render("500", { message: `I'm sorry but we have encountered the following error: ${error}`}); 
        }
  });

app.get('/solutions/deleteProject/:id', ensureLogin, async (req, res) => {
    try {
        const { id } = req.params; 
        await projectsContainer.deleteProject(id); 
        const updatedProjects = await projectsContainer.getAllProjects(); 
        res.render("projects", { projects: updatedProjects }); 
    } catch (error) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
    }
}); 