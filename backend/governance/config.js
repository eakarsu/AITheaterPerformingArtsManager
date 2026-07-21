module.exports={
  caseType:'approved_theater_production_release',initialState:'source_registered',
  states:['source_registered','rights_verified','assets_versioned','timeline_edited','render_queued','rendered','render_failed','production_review','ticketing_reconciled','publication_approved','published','exported','closed'],
  createRoles:['producer','production_manager'],assessmentRoles:['producer','editor','rights_reviewer','accessibility_reviewer'],auditRoles:['production_manager','rights_reviewer','auditor'],connectorRoles:['integration_operator','production_manager'],
  evidenceKinds:['source_manifest','rights_license','consent_release','asset_manifest','timeline_version','render_receipt','render_failure','quality_report','accessibility_report','brand_moderation_report','watermark_disclosure','translation_report','ticketing_receipt','approval_record','publish_receipt','export_manifest','usage_record'],
  requiredSignals:['sourceVersion','timelineVersion','assetVersion','renderVersion','ticketingVersion','policyVersion','licenseStatus','consentStatus','timingFidelity','layoutFidelity','accessibilityStatus','moderationStatus','multilingualStatus','watermarkStatus','exportProfile'],
  professionalBoundary:'Generated or edited production media remains a draft. Qualified rights, accessibility, production, and publication reviewers approve use; assessment cannot sell tickets, publish, or represent partner validation.',
  connectors:[{name:'media_model',purpose:'queued render receipts only'},{name:'rights_asset_library',purpose:'license and consent versions'},{name:'object_storage',purpose:'encrypted asset pointers'},{name:'cdn',purpose:'versioned delivery receipts'},{name:'transcription_translation',purpose:'caption and locale receipts'},{name:'publishing',purpose:'signed publish/export receipts'},{name:'ticketing',purpose:'ticket inventory and settlement receipts'},{name:'usage_accounting',purpose:'metered usage receipts'}],
  transitions:[
    {from:'source_registered',action:'verify_rights',to:'rights_verified',roles:['rights_reviewer'],requiresEvidence:true},
    {from:'rights_verified',action:'lock_assets',to:'assets_versioned',roles:['producer','editor'],requiresEvidence:true},
    {from:'assets_versioned',action:'lock_timeline',to:'timeline_edited',roles:['producer','editor'],requiresEvidence:true},
    {from:'timeline_edited',action:'queue_render',to:'render_queued',roles:['editor','integration_operator'],requiresEvidence:true},
    {from:'render_queued',action:'record_render',to:'rendered',roles:['integration_operator'],requiresEvidence:true},
    {from:'render_queued',action:'record_render_failure',to:'render_failed',roles:['integration_operator'],requiresEvidence:true},
    {from:'render_failed',action:'retry_render',to:'render_queued',roles:['editor','integration_operator'],requiresEvidence:true},
    {from:'rendered',action:'submit_production_review',to:'production_review',roles:['accessibility_reviewer','producer'],requiresEvidence:true,dualControl:true},
    {from:'production_review',action:'reconcile_ticketing',to:'ticketing_reconciled',roles:['integration_operator','finance_reviewer'],requiresEvidence:true,dualControl:true},
    {from:'ticketing_reconciled',action:'approve_publication',to:'publication_approved',roles:['production_manager','rights_reviewer'],requiresEvidence:true,dualControl:true},
    {from:'publication_approved',action:'record_publish',to:'published',roles:['integration_operator','production_manager'],requiresEvidence:true,dualControl:true},
    {from:'publication_approved',action:'record_export',to:'exported',roles:['producer','editor'],requiresEvidence:true,dualControl:true},
    {from:'published',action:'close_release',to:'closed',roles:['production_manager'],requiresEvidence:true},
    {from:'exported',action:'close_release',to:'closed',roles:['production_manager'],requiresEvidence:true}
  ],
  acceptedFixture:{sourceVersion:'s1',timelineVersion:'t1',assetVersion:'a1',renderVersion:'r1',ticketingVersion:'tk1',policyVersion:'p1',licenseStatus:'verified',consentStatus:'verified',timingFidelity:0.98,layoutFidelity:0.97,accessibilityStatus:'passed',moderationStatus:'passed',multilingualStatus:'passed',watermarkStatus:'disclosed',exportProfile:'accessible_master'},
  rejectedFixture:{sourceVersion:'s1',timelineVersion:'t1',assetVersion:'a1',renderVersion:'r1',ticketingVersion:'tk1',policyVersion:'p1',licenseStatus:'missing',consentStatus:'verified',timingFidelity:0.98,layoutFidelity:0.97,accessibilityStatus:'passed',moderationStatus:'passed',multilingualStatus:'passed',watermarkStatus:'disclosed',exportProfile:'accessible_master'},
  readyDisposition:'independent_production_publication_review_required',holdDisposition:'rights_quality_accessibility_or_ticketing_hold',decisionField:'publishCommand',
  assess:x=>{const timing=Number(x.timingFidelity),layout=Number(x.layoutFidelity);const ready=x.licenseStatus==='verified'&&x.consentStatus==='verified'&&timing>=0.95&&layout>=0.95&&x.accessibilityStatus==='passed'&&x.moderationStatus==='passed'&&x.multilingualStatus==='passed'&&x.watermarkStatus==='disclosed'&&['accessible_master','broadcast_master','archive_master'].includes(x.exportProfile);return{disposition:ready?'independent_production_publication_review_required':'rights_quality_accessibility_or_ticketing_hold',publishCommand:null,ticketSaleCommand:null,metrics:{timingFidelity:timing,layoutFidelity:layout},versions:{source:x.sourceVersion,timeline:x.timelineVersion,assets:x.assetVersion,render:x.renderVersion,ticketing:x.ticketingVersion}};}
};
