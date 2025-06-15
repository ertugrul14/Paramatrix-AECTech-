// JSON to IFC Converter using web-ifc library
// Package: web-ifc (verified at https://www.npmjs.com/package/web-ifc)
// Repository: https://github.com/ThatOpen/engine_web-ifc

// Installation: npm install web-ifc
// CDN: https://unpkg.com/web-ifc@0.0.57/web-ifc-api.js

const WebIFC = require("web-ifc/web-ifc-api.js");

class JSONToIFCConverter {
    constructor() {
        this.ifcApi = null;
        this.modelID = null;
        this.entityId = 1;
        this.entities = new Map();
    }

    // Initialize the web-ifc API
    async initialize() {
        try {
            this.ifcApi = new WebIFC.IfcAPI();
            await this.ifcApi.Init();
            console.log("IFC API initialized successfully");
            return true;
        } catch (error) {
            console.error("Failed to initialize IFC API:", error);
            return false;
        }
    }

    // Generate a new unique entity ID
    getNextEntityId() {
        return this.entityId++;
    }

    // Generate a GlobalId (required for IFC entities)
    generateGlobalId() {
        // Simple GUID generation for IFC GlobalId
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
        let result = '';
        for (let i = 0; i < 22; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Create IFC header information
    createHeader() {
        const timestamp = new Date().toISOString();
        
        // Create header entities
        const ownerHistoryId = this.getNextEntityId();
        const personId = this.getNextEntityId();
        const organizationId = this.getNextEntityId();
        const personAndOrgId = this.getNextEntityId();
        const applicationId = this.getNextEntityId();

        // Create Person
        const person = new WebIFC.IfcPerson(
            null, // Id
            "System", // FamilyName
            "Converter", // GivenName
            null, // MiddleNames
            null, // PrefixTitles
            null, // SuffixTitles
            null, // Roles
            null  // Addresses
        );
        this.entities.set(personId, person);

        // Create Organization
        const organization = new WebIFC.IfcOrganization(
            null, // Id
            "JSON to IFC Converter", // Name
            "Automated Conversion System", // Description
            null, // Roles
            null  // Addresses
        );
        this.entities.set(organizationId, organization);

        // Create PersonAndOrganization
        const personAndOrg = new WebIFC.IfcPersonAndOrganization(
            personId, // ThePerson
            organizationId, // TheOrganization
            null // Roles
        );
        this.entities.set(personAndOrgId, personAndOrg);

        // Create Application
        const application = new WebIFC.IfcApplication(
            organizationId, // ApplicationDeveloper
            "1.0", // Version
            "JSON to IFC Converter", // ApplicationFullName
            "CONVERTER_APP" // ApplicationIdentifier
        );
        this.entities.set(applicationId, application);

        // Create OwnerHistory
        const ownerHistory = new WebIFC.IfcOwnerHistory(
            personAndOrgId, // OwningUser
            applicationId, // OwningApplication
            null, // State
            WebIFC.IfcChangeActionEnum.ADDED, // ChangeAction
            null, // LastModifiedDate
            personAndOrgId, // LastModifyingUser
            applicationId, // LastModifyingApplication
            Math.floor(Date.now() / 1000) // CreationDate
        );
        this.entities.set(ownerHistoryId, ownerHistory);

        return ownerHistoryId;
    }

    // Create basic IFC project structure
    createProjectStructure(ownerHistoryId) {
        const projectId = this.getNextEntityId();
        const siteId = this.getNextEntityId();
        const buildingId = this.getNextEntityId();
        const unitAssignmentId = this.getNextEntityId();
        const geomContextId = this.getNextEntityId();
        const axisPlacementId = this.getNextEntityId();
        const originId = this.getNextEntityId();

        // Create Cartesian Point (Origin)
        const origin = new WebIFC.IfcCartesianPoint([0.0, 0.0, 0.0]);
        this.entities.set(originId, origin);

        // Create Axis Placement
        const axisPlacement = new WebIFC.IfcAxis2Placement3D(
            originId, // Location
            null, // Axis
            null  // RefDirection
        );
        this.entities.set(axisPlacementId, axisPlacement);

        // Create Geometric Representation Context
        const geomContext = new WebIFC.IfcGeometricRepresentationContext(
            null, // ContextIdentifier
            "Model", // ContextType
            3, // CoordinateSpaceDimension
            0.01, // Precision
            axisPlacementId, // WorldCoordinateSystem
            null // TrueNorth
        );
        this.entities.set(geomContextId, geomContext);

        // Create SI Unit (Meter)
        const lengthUnit = new WebIFC.IfcSIUnit(
            null, // Dimensions
            WebIFC.IfcUnitEnum.LENGTHUNIT, // UnitType
            null, // Prefix
            WebIFC.IfcSIUnitName.METRE // Name
        );
        
        // Create Unit Assignment
        const unitAssignment = new WebIFC.IfcUnitAssignment([lengthUnit]);
        this.entities.set(unitAssignmentId, unitAssignment);

        // Create Project
        const project = new WebIFC.IfcProject(
            this.generateGlobalId(), // GlobalId
            ownerHistoryId, // OwnerHistory
            "JSON Converted Project", // Name
            "Project created from JSON data", // Description
            null, // ObjectType
            null, // LongName
            null, // Phase
            [geomContextId], // RepresentationContexts
            unitAssignmentId // UnitsInContext
        );
        this.entities.set(projectId, project);

        // Create Site
        const site = new WebIFC.IfcSite(
            this.generateGlobalId(), // GlobalId
            ownerHistoryId, // OwnerHistory
            "Default Site", // Name
            "Site created from JSON conversion", // Description
            null, // ObjectType
            null, // ObjectPlacement
            null, // Representation
            null, // LongName
            WebIFC.IfcElementCompositionEnum.ELEMENT, // CompositionType
            null, // RefLatitude
            null, // RefLongitude
            null, // RefElevation
            null, // LandTitleNumber
            null  // SiteAddress
        );
        this.entities.set(siteId, site);

        // Create Building
        const building = new WebIFC.IfcBuilding(
            this.generateGlobalId(), // GlobalId
            ownerHistoryId, // OwnerHistory
            "Default Building", // Name
            "Building created from JSON conversion", // Description
            null, // ObjectType
            null, // ObjectPlacement
            null, // Representation
            null, // LongName
            WebIFC.IfcElementCompositionEnum.ELEMENT, // CompositionType
            null, // ElevationOfRefHeight
            null, // ElevationOfTerrain
            null  // BuildingAddress
        );
        this.entities.set(buildingId, building);

        return {
            projectId,
            siteId,
            buildingId,
            geomContextId,
            ownerHistoryId
        };
    }

    // Convert JSON object to IFC element
    convertJSONObjectToIFC(jsonObject, ownerHistoryId, contextId) {
        const elementId = this.getNextEntityId();
        const placementId = this.getNextEntityId();
        const localPlacementId = this.getNextEntityId();
        const axisPlacementId = this.getNextEntityId();
        const originId = this.getNextEntityId();

        // Create origin point
        const origin = new WebIFC.IfcCartesianPoint([
            jsonObject.position?.x || 0.0,
            jsonObject.position?.y || 0.0,
            jsonObject.position?.z || 0.0
        ]);
        this.entities.set(originId, origin);

        // Create axis placement
        const axisPlacement = new WebIFC.IfcAxis2Placement3D(
            originId, // Location
            null, // Axis
            null  // RefDirection
        );
        this.entities.set(axisPlacementId, axisPlacement);

        // Create local placement
        const localPlacement = new WebIFC.IfcLocalPlacement(
            null, // PlacementRelTo
            axisPlacementId // RelativePlacement
        );
        this.entities.set(localPlacementId, localPlacement);

        // Determine IFC type based on JSON object type
        let ifcElement;
        const globalId = this.generateGlobalId();
        const name = jsonObject.name || "Unnamed Element";
        const description = jsonObject.description || "Element converted from JSON";

        switch (jsonObject.type?.toLowerCase()) {
            case 'wall':
                ifcElement = new WebIFC.IfcWall(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    null  // PredefinedType
                );
                break;

            case 'door':
                ifcElement = new WebIFC.IfcDoor(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    null, // OverallHeight
                    null, // OverallWidth
                    null, // PredefinedType
                    null, // OperationType
                    null  // UserDefinedOperationType
                );
                break;

            case 'window':
                ifcElement = new WebIFC.IfcWindow(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    null, // OverallHeight
                    null, // OverallWidth
                    null, // PredefinedType
                    null, // PartitioningType
                    null  // UserDefinedPartitioningType
                );
                break;

            case 'slab':
                ifcElement = new WebIFC.IfcSlab(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    null  // PredefinedType
                );
                break;

            case 'column':
                ifcElement = new WebIFC.IfcColumn(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    null  // PredefinedType
                );
                break;

            case 'beam':
                ifcElement = new WebIFC.IfcBeam(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    null  // PredefinedType
                );
                break;

            default:
                // Use BuildingElementProxy for unknown types
                ifcElement = new WebIFC.IfcBuildingElementProxy(
                    globalId,
                    ownerHistoryId,
                    name,
                    description,
                    null, // ObjectType
                    localPlacementId, // ObjectPlacement
                    null, // Representation
                    null, // Tag
                    WebIFC.IfcBuildingElementProxyTypeEnum.USERDEFINED, // PredefinedType
                    jsonObject.type || "UNKNOWN" // UserDefinedType
                );
                break;
        }

        this.entities.set(elementId, ifcElement);
        return elementId;
    }

    // Create property set for JSON attributes
    createPropertySet(jsonObject, ownerHistoryId, elementId) {
        if (!jsonObject.properties) return null;

        const propertySetId = this.getNextEntityId();
        const relDefinesId = this.getNextEntityId();
        const properties = [];

        // Convert JSON properties to IFC properties
        Object.entries(jsonObject.properties).forEach(([key, value]) => {
            const propId = this.getNextEntityId();
            let ifcProperty;

            if (typeof value === 'string') {
                const textValueId = this.getNextEntityId();
                const textValue = new WebIFC.IfcText(value);
                this.entities.set(textValueId, textValue);

                ifcProperty = new WebIFC.IfcPropertySingleValue(
                    key, // Name
                    null, // Description
                    textValueId, // NominalValue
                    null // Unit
                );
            } else if (typeof value === 'number') {
                const numValueId = this.getNextEntityId();
                const numValue = new WebIFC.IfcReal(value);
                this.entities.set(numValueId, numValue);

                ifcProperty = new WebIFC.IfcPropertySingleValue(
                    key, // Name
                    null, // Description
                    numValueId, // NominalValue
                    null // Unit
                );
            } else if (typeof value === 'boolean') {
                const boolValueId = this.getNextEntityId();
                const boolValue = new WebIFC.IfcBoolean(value);
                this.entities.set(boolValueId, boolValue);

                ifcProperty = new WebIFC.IfcPropertySingleValue(
                    key, // Name
                    null, // Description
                    boolValueId, // NominalValue
                    null // Unit
                );
            }

            if (ifcProperty) {
                this.entities.set(propId, ifcProperty);
                properties.push(propId);
            }
        });

        if (properties.length === 0) return null;

        // Create Property Set
        const propertySet = new WebIFC.IfcPropertySet(
            this.generateGlobalId(), // GlobalId
            ownerHistoryId, // OwnerHistory
            "JSON_Properties", // Name
            "Properties converted from JSON", // Description
            properties // HasProperties
        );
        this.entities.set(propertySetId, propertySet);

        // Create relationship to define properties
        const relDefines = new WebIFC.IfcRelDefinesByProperties(
            this.generateGlobalId(), // GlobalId
            ownerHistoryId, // OwnerHistory
            "PropertyDefinition", // Name
            "Defines properties from JSON", // Description
            [elementId], // RelatedObjects
            propertySetId // RelatingPropertyDefinition
        );
        this.entities.set(relDefinesId, relDefines);

        return propertySetId;
    }

    // Main conversion function
    async convertJSONToIFC(jsonData) {
        if (!this.ifcApi) {
            throw new Error("IFC API not initialized. Call initialize() first.");
        }

        try {
            // Parse JSON if it's a string
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            // Create header and project structure
            const ownerHistoryId = this.createHeader();
            const structure = this.createProjectStructure(ownerHistoryId);

            // Convert JSON objects to IFC elements
            const elementIds = [];
            
            if (data.objects && Array.isArray(data.objects)) {
                for (const jsonObject of data.objects) {
                    const elementId = this.convertJSONObjectToIFC(
                        jsonObject,
                        ownerHistoryId,
                        structure.geomContextId
                    );
                    elementIds.push(elementId);

                    // Add properties if they exist
                    this.createPropertySet(jsonObject, ownerHistoryId, elementId);
                }
            }

            // Create spatial relationships
            if (elementIds.length > 0) {
                const relContainsId = this.getNextEntityId();
                const relContains = new WebIFC.IfcRelContainedInSpatialStructure(
                    this.generateGlobalId(), // GlobalId
                    ownerHistoryId, // OwnerHistory
                    "BuildingContainer", // Name
                    "Contains elements in building", // Description
                    elementIds, // RelatedElements
                    structure.buildingId // RelatingStructure
                );
                this.entities.set(relContainsId, relContains);
            }

            // Create spatial hierarchy relationships
            const relAggregatesProjectId = this.getNextEntityId();
            const relAggregatesProject = new WebIFC.IfcRelAggregates(
                this.generateGlobalId(), // GlobalId
                ownerHistoryId, // OwnerHistory
                "ProjectContainer", // Name
                "Project contains site", // Description
                structure.projectId, // RelatingObject
                [structure.siteId] // RelatedObjects
            );
            this.entities.set(relAggregatesProjectId, relAggregatesProject);

            const relAggregatesSiteId = this.getNextEntityId();
            const relAggregatesSite = new WebIFC.IfcRelAggregates(
                this.generateGlobalId(), // GlobalId
                ownerHistoryId, // OwnerHistory
                "SiteContainer", // Name
                "Site contains building", // Description
                structure.siteId, // RelatingObject
                [structure.buildingId] // RelatedObjects
            );
            this.entities.set(relAggregatesSiteId, relAggregatesSite);

            console.log(`Converted ${elementIds.length} objects to IFC entities`);
            return this.generateIFCFile();

        } catch (error) {
            console.error("Error during JSON to IFC conversion:", error);
            throw error;
        }
    }

    // Generate the final IFC file content
    generateIFCFile() {
        let ifcContent = '';
        
        // Add IFC header
        ifcContent += 'ISO-10303-21;\n';
        ifcContent += 'HEADER;\n';
        ifcContent += "FILE_DESCRIPTION(('JSON to IFC Conversion'), '2;1');\n";
        ifcContent += `FILE_NAME('converted_model.ifc', '${new Date().toISOString()}', ('JSON to IFC Converter'), ('Conversion System'), 'IFC4', 'JSON to IFC Converter v1.0', 'Conversion System v1.0');\n`;
        ifcContent += "FILE_SCHEMA(('IFC4'));\n";
        ifcContent += 'ENDSEC;\n\n';
        
        // Add data section
        ifcContent += 'DATA;\n';
        
        // Add all entities
        for (const [entityId, entity] of this.entities) {
            ifcContent += `#${entityId}= ${this.serializeEntity(entity)};\n`;
        }
        
        ifcContent += 'ENDSEC;\n';
        ifcContent += 'END-ISO-10303-21;\n';
        
        return ifcContent;
    }

    // Serialize entity to IFC STEP format (simplified)
    serializeEntity(entity) {
        // This is a simplified serialization - in practice, you'd use the web-ifc API methods
        // to properly serialize entities
        return entity.constructor.name.toUpperCase() + '(' + 
               Object.values(entity).map(value => this.serializeValue(value)).join(', ') + ')';
    }

    // Serialize values to IFC format
    serializeValue(value) {
        if (value === null || value === undefined) {
            return '$';
        } else if (typeof value === 'string') {
            return "'" + value.replace(/'/g, "''") + "'";
        } else if (typeof value === 'number') {
            return value.toString();
        } else if (typeof value === 'boolean') {
            return value ? '.T.' : '.F.';
        } else if (Array.isArray(value)) {
            return '(' + value.map(v => this.serializeValue(v)).join(', ') + ')';
        } else {
            return '#' + value.toString();
        }
    }

    // Cleanup method
    cleanup() {
        if (this.ifcApi && this.modelID !== null) {
            this.ifcApi.CloseModel(this.modelID);
        }
        this.entities.clear();
        this.entityId = 1;
    }
}

// Example usage function
async function convertJSONFileToIFC(jsonFilePath, outputPath) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        // Read JSON file
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        
        // Create converter instance
        const converter = new JSONToIFCConverter();
        
        // Initialize the converter
        const initialized = await converter.initialize();
        if (!initialized) {
            throw new Error("Failed to initialize converter");
        }
        
        // Convert JSON to IFC
        const ifcContent = await converter.convertJSONToIFC(jsonData);
        
        // Write IFC file
        fs.writeFileSync(outputPath, ifcContent, 'utf8');
        
        console.log(`Successfully converted ${jsonFilePath} to ${outputPath}`);
        
        // Cleanup
        converter.cleanup();
        
        return true;
        
    } catch (error) {
        console.error("Conversion failed:", error);
        return false;
    }
}

// Example JSON structure expected:
const exampleJSON = {
    "objects": [
        {
            "type": "wall",
            "name": "Wall-001",
            "description": "External wall",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "properties": {
                "material": "Concrete",
                "thickness": 0.2,
                "height": 3.0,
                "fireRating": "60min",
                "loadBearing": true
            }
        },
        {
            "type": "door",
            "name": "Door-001",
            "description": "Main entrance door",
            "position": {
                "x": 2,
                "y": 0,
                "z": 0
            },
            "properties": {
                "material": "Wood",
                "width": 0.9,
                "height": 2.1,
                "fireRating": "30min"
            }
        }
    ]
};

// Export the converter class and utility function
module.exports = {
    JSONToIFCConverter,
    convertJSONFileToIFC,
    exampleJSON
};

// Browser usage example (if using in browser with CDN)
/*
// Include web-ifc from CDN:
// <script src="https://unpkg.com/web-ifc@0.0.57/web-ifc-api.js"></script>

// Then use the converter:
const converter = new JSONToIFCConverter();
await converter.initialize();
const ifcContent = await converter.convertJSONToIFC(jsonData);
// Download or use the IFC content
*/