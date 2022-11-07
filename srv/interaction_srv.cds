using app.DEV_TOOLS from '../db/interactions';


service CatalogService {

 entity Tech_Process
    as projection on DEV_TOOLS.TECHNICAL_PROCESS;

 entity Tech_Process_Dependency
    as projection on  DEV_TOOLS.TECHNICAL_PROCESS_DEPENDENCY

entity Tech_Process_Ownership
    as projection on DEV_TOOLS.TECHNICAL_OBJECT_OWNERSHIP

entity Tech_Object
    as projection on DEV_TOOLS.TECHINCAL_OBJECT2;


function calc(a: LargeString) returns LargeString
}