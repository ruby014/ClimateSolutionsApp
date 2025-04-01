require('dotenv').config(); 
require('pg'); 
const Sequelize = require('sequelize'); 

// Set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true, // This will help you connect to the database with SSL
        rejectUnauthorized: false, // Allows self-signed certificates
      },
    },
  });

  sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

// Define a "Sector" model 
const Sector = sequelize.define(
    'Sector', 
    {
        id: {
            type: Sequelize.INTEGER, 
            primaryKey: true, 
            autoIncrement: true, 
        },
        sector_name: Sequelize.STRING, 
    },
    {
        // disable this as per assignment specs 
        createdAt: false, 
        updatedAt: false, 
    }
); 

// define a Project model 
const Project = sequelize.define(
    'Project', 
    {
        id: {
            type: Sequelize.INTEGER, 
            primaryKey: true, 
            autoIncrement: true, 
        }, 
        title: Sequelize.STRING, 
        feature_img_url: Sequelize.STRING, 
        summary_short: Sequelize.TEXT, 
        intro_short: Sequelize.TEXT, 
        impact: Sequelize.TEXT,
        original_source_url: Sequelize.STRING, 
        sector_id: {
            type: Sequelize.INTEGER, 
            references: {
                model: Sector, 
                key: 'id', 
            }
        },
    }, 
    {
        createdAt: false, 
        updatedAt: false, 
    }
)

// create an association between the two models 
Project.belongsTo(Sector, { foreignKey: 'sector_id' }); 

let Initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync() // makes sure the models are correctly created in db before we insert or manipulate data 
            .then(() => {
                resolve(Project.findAll({ include: [Sector] }))
            })
            .catch((error) => reject(error)); 
    });
};

// Returns the completed projects array 
let getAllProjects = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync() 
            .then(() => {
                return Project.findAll({
                    include: [Sector] 
                });
            })
            .then((projects) => {
                if (!projects || projects.length === 0) {
                    reject("No projects found.");
                    return;
                }
                const processedProjects = projects.map(project => {
                    const projectData = project.get(); 
                    projectData.sector = project.Sector ? project.Sector.sector_name : "Unknown";
                    return projectData;
                });

                resolve(processedProjects); 
            })
            .catch((error) => {
                console.error("Failed to initialize projects:", error);
                reject(error); 
            });
    });
}; 

let getProjectById = (projectId) => {
    return new Promise((resolve, reject) => {
        Project.findOne({
            include: [Sector], 
            where: { id: projectId }
        })
            .then((project) => resolve(project))
            .catch((error) => reject(error.message));  
    }); 
}; 

let getProjectsBySector = (sector)  => {
    return new Promise((resolve, reject) => {
        Project.findAll({
            include: [Sector], where: {
                '$Sector.sector_name$':{
                    [Sequelize.Op.iLike]:`%${sector}%`
                }
            }
        })
            .then(resolve)
            .catch((error) => reject(error.message)); 
    }); 
};

let getAllSectors = () => {
    return new Promise((resolve, reject) => {
        Sector.findAll() 
        .then((sectors) => {
            resolve(sectors); 
        })
        .catch((error) => {
            reject(error.message)
        })
    })    
}

let addProject = (projectData) => {
    return new Promise((resolve, reject) => {
        Project.create(projectData)
        .then(() => resolve())
        .catch((error) => reject(error.errors?.[0]?.message || error.message)); 
    })
}

let editProject = (id, projectData) => {
    return new Promise((resolve, reject) => {
        Project.update(projectData, { where: { id: id } })
         .then(() => resolve())
         .catch((error) => reject(error.errors?.[0]?.message || error.message))
    })
}

let deleteProject = (id) => {
    return new Promise((resolve, reject) => {
        Project.destroy({
            where: { id: id }, 
        })
        .then(() => resolve())
        .catch((error) => reject(error.errors?.[0]?.message || error.message))
    })
}

// To ensure this file functions as a module
module.exports = { Initialize, getAllProjects, getProjectById, getProjectsBySector, getAllSectors, addProject, editProject, deleteProject };