<!--------------- SECTION 1 --------------->
**NPW Pilot Architecture proposal**

## **Application Overview**

## **Proposed architecture solutions**

Solution 1- **IN UC7**

Solution  2 - **AS UC7 MODULE**

**PRO**

**CONS**

- **Better User Experience**: Unified interface for seamless user experience.
- **No Need to Build New Infrastructure**: Utilize existing infrastructure
- **Ease of Maintenance**: Centralized management simplifies maintenance tasks.
- **Great Reuse of Existing Code**: Leverage existing code to speed development.

- **Risk of Introducing Bugs**: New development may affect existing functionalities.
- **Release Constraints**: Coordinating releases can lead to delays.
- **Limited User Experience Customization**: Cannot tailor experience
- **Unified User Rights**: Same access rights across all functionalities.

**PRO**

**CONS**

- **New Architecture**: New microservices, potentially with new technology stack.
- **Clean Development**: Clear path for developing proof of concept.
- **Risk Mitigation**: Issues in new application won't affect existing one.
- **Tailored User Experience**: Design UI/UX specifically for new application.

- **New Infrastructure Setup:** Additional infrastructure setup required.
- **Disconnection with UC7**: Users need to switch to UC7 for analysis.
- **Resource Duplication**: Potential duplication of infrastructure and data.
- **Increased Costs**: Higher initial development and operational costs.

<!--------------- SECTION 2 --------------->
## **Final - architecture solutions**

**1**

**2**

**3**

**4**

- **Single Endpoint:** The same endpoint is used for both the UC7 and NPW screens, with different ingress routes rules.

- **User Profiler**: A dedicated service for managing user profiles (limited to preselected fabs and work areas). This is a temporary solution that can be evolved to integrate with the future source of truth.

- **Activity Tracker**: Similar to what was done for CPv2, a service for activity tracking will be created within the namespace.

- **Delta Table Access:** Data access will be made using a private endpoint and queries.

- **Data Jobs**: New dedicated jobs for NPW analysis will leverage the existing UC7 infrastructure and data.

**5**

**SOLUTION HIGHLIGHTS**

**1**

**2**

**3**

**4**

**5**

<!--------------- SECTION 3 --------------->
## **Activity Tracking and User Profiler evolution**

**USER PROFILER**

**ACTIVITY TRACKING**

{

user: mario.rossi@st.com

dashboard: «CPv2»,

feature: «Login»,

data: {\<json_object_containing other_data>}

}

In the future, the database table migth be replaced by an integration with the designated source of truth.

Activity Tracking pod will be transitioned to a general-purpose service layer. The new version will be capable of accepting requests without an authentication token and will include a new data field for applications to add information."

truth

<!--------------- SECTION 4 --------------->
## **UC7 Databricks Flow**

NPW has an independent flow in terms of template training and automatic inference