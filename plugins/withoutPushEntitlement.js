// AI-assisted (Claude Code): removes the push notifications entitlement that expo-notifications adds on its own at build time.
// UNI schedules only local reminders, which need no entitlement; the App ID has no Push capability (decision 2026-11-12).
// Remove this plugin if the app ever sends push notifications.
const { withEntitlementsPlist } = require("expo/config-plugins");

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults["aps-environment"];
    return mod;
  });
};
