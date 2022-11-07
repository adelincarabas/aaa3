//namespace app.DEV_TOOLS;

context app.DEV_TOOLS {
entity TECHNICAL_PROCESS {
  key OWNER : String(50);
  ![KEY] : String(50);
  APPLICATION_VERSION : String(50);
  DESCRIPTION  : String(200);
};
entity TECHNICAL_PROCESS_DEPENDENCY {
    key OWNER : String(50);
    BUSINESS_PROCESS: String(50);
    TECHNICAL_PROCESS: String(50);
    DEPENDING_ON_TECHNICAL_PROCESS: String(50);
    ![KEY]: TECHINCAL_OBJECT2:Key_Name;
    TECHNICAL_OBJECT: String(50);
};

entity TECHNICAL_OBJECT_OWNERSHIP {
    key OWNER : String(50);
    BACKUP : String(10);
    TECHNICAL_PROCESS: String(50);
    DEPENDENCY_TYPE: String(50);
    Object_Type: String(50);
    ACESS_TYPE: String(50);
    Repository: String(50);
    FILE: String(200);
    TECHNICAL_OBJECT: String(50);
}

entity TECHINCAL_OBJECT2{
    key Key_Name: String(50);
    Name: String(500);
    Object_Type: String(50);
}
}
