/** Shared domain shapes for the edge federation demo. Kept as JSDoc for Vite's JS setup. */
/** @typedef {{used:number,total:number}} ResourceCapacity */
/** @typedef {{id:string,name:string,city:string,region:string,country:string,lat:number,lon:number,availableVcpu:number,totalVcpu:number,availableMemoryGb:number,totalMemoryGb:number,latencyProfile:{minMs:number,maxMs:number},operatorPlatformName:string,local:boolean,subscribed:boolean}} EdgeZone */
/** @typedef {{id:string,name:string,image:string,status:'RUNNING'|'PENDING'|'FAILED'|'TERMINATED',endpoint:string,location:string,createdAt:string,rationale:string}} Deployment */
/** @typedef {{id:string,name:string,region:string,mcc:string,mnc:string,endpoint:string,status:'ACTIVE',expiresAt:string}} FederationContext */
/** @typedef {{id:string,timestamp:string,application:string,decision:'LOCAL'|'EWBI_HANDOVER'|'REJECTED',rationale:string,target:string,zone:string}} HandoverLog */
export const DeploymentStatus = Object.freeze({ RUNNING: 'RUNNING', PENDING: 'PENDING', FAILED: 'FAILED', TERMINATED: 'TERMINATED' });
export const LOCAL_EDGE_ZONE_ID = 'pt-aveiro-edge-01';

