import { createListenerMiddleware } from '@reduxjs/toolkit';
import { wsMessageReceived } from './websocketMiddleware';
import { expoRegistryApi } from '../services/expoRegistryApi';
import { sponsorMasterApi } from '../services/sponsorMasterApi';
import { awardRegistryApi } from '../services/awardRegistryApi';
import { curatedSessionApi } from '../services/curatedSessionApi';
import { ministerialSessionApi } from '../services/ministerialSessionApi';
import { categoryWiseDeliverablesApi } from "../services/categoryWiseDeliverableMasterApi";
import { eventSuperMasterApi } from "../services/eventSuperMasterApi";
import { eventMasterApi } from "../services/eventMasterApi";
import { deliverableApi } from '../services/deliverablesApi';
import { categoryMasterApi } from '../services/categoryMasterApi';
import { categorySubMasterApi } from '../services/categorySubMasterApi';
import { awardMasterApi } from "../services/awardMasterApi";
import { slotMasterApi } from '../services/slotMasterApi';
import { passesRegistryApi } from '../services/passesRegistryApi';
import { speakerTrackerApi } from '../services/speakerTrackerApi';
import { secretarialRoundtableApi } from '../services/secretarialRoundtableApi';
import { networkingSlotApi } from '../services/networkingSlotApi';
import { awardSubCategoryApi } from '../services/awardSubCategoryApi';
import { TaskReportApi } from '../services/taskreportApi';
import { TaskDescriptionApi } from '../services/taskdescriptionApi';
import { calendarApi } from '../services/calendarApi';


export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
    actionCreator: wsMessageReceived,
    effect: async (action, listenerApi) => {
        if (action.payload === "refresh_expo_registry") {
            console.log("Received refresh signal. Invalidating ExpoRegistry cache.");

            listenerApi.dispatch(
                expoRegistryApi.util.invalidateTags(['ExpoRegistry'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
            listenerApi.dispatch(
                awardRegistryApi.util.invalidateTags(['AwardRegistry'])
            );
            listenerApi.dispatch(
                curatedSessionApi.util.invalidateTags(['CuratedSession'])
            );
            listenerApi.dispatch(
                ministerialSessionApi.util.invalidateTags(['MinisterialSession'])
            );
            listenerApi.dispatch(
                slotMasterApi.util.invalidateTags(['SlotMaster'])
            );
            listenerApi.dispatch(
                passesRegistryApi.util.invalidateTags(['PassesRegistry'])
            );
            listenerApi.dispatch(
                speakerTrackerApi.util.invalidateTags(['SpeakerTracker'])
            );
            listenerApi.dispatch(
                secretarialRoundtableApi.util.invalidateTags(['SecretarialRoundtable'])
            );
            listenerApi.dispatch(
                networkingSlotApi.util.invalidateTags(['NetworkingSlot'])
            );
        }
        else if (action.payload === "refresh_ministerial_sessions") {
            console.log("Received refresh signal. Invalidating Ministerial Sessions cache.");
            listenerApi.dispatch(
                ministerialSessionApi.util.invalidateTags(['MinisterialSession'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_curated_sessions") {
            console.log("Received refresh signal. Invalidating Curated Sessions cache.");
            listenerApi.dispatch(
                curatedSessionApi.util.invalidateTags(['CuratedSession'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_category_wise_deliverables") {
            console.log("Received refresh signal. Invalidating Curated Sessions cache.");
            listenerApi.dispatch(
                categoryWiseDeliverablesApi.util.invalidateTags(['CategoryWiseDeliverables'])
            );
        }
        else if (action.payload === "refresh_event_super") {
            console.log("Received refresh signal. Invalidating Event Super Master cache.");
            listenerApi.dispatch(
                eventSuperMasterApi.util.invalidateTags(['EventSuperMaster'])
            );
        }
        else if (action.payload === "refresh_event_master") {
            console.log("Received refresh signal. Invalidating Event Master cache.");
            listenerApi.dispatch(
                eventMasterApi.util.invalidateTags(['EventMaster'])
            );
        }
        else if (action.payload === "refresh_deliverables") {
            console.log("Received refresh signal. Invalidating Deliverables cache.");
            listenerApi.dispatch(
                deliverableApi.util.invalidateTags(['Deliverable'])
            );
        }
        else if (action.payload === "refresh_category") {
            console.log("Received refresh signal. Invalidating Category Master cache.");
            listenerApi.dispatch(
                categoryMasterApi.util.invalidateTags(['CategoryMaster'])
            );
        }
        else if (action.payload === "refresh_category_sub") {
            console.log("Received refresh signal. Invalidating Category Sub Master cache.");
            listenerApi.dispatch(
                categorySubMasterApi.util.invalidateTags(['CategorySubMaster'])
            );
        }
        else if (action.payload === "refresh_award_master") {
            console.log("Received refresh signal. Invalidating Award Master cache.");
            listenerApi.dispatch(
                awardMasterApi.util.invalidateTags(['AwardMaster'])
            );
        }
        else if (action.payload === "refresh_expo_registry_trackers") {
            console.log("Received refresh signal. Invalidating Expo Registry cache.");
            listenerApi.dispatch(
                expoRegistryApi.util.invalidateTags(['ExpoRegistry'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_award_registry_trackers") {
            console.log("Received refresh signal. Invalidating Award Registry cache.");
            listenerApi.dispatch(
                awardRegistryApi.util.invalidateTags(['AwardRegistry'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_slot_master") {
            console.log("Received refresh signal. Invalidating Award Registry cache.");
            listenerApi.dispatch(
                slotMasterApi.util.invalidateTags(['SlotMaster'])
            );
        }
        else if (action.payload === "refresh_passes_registries") {
            console.log("Received refresh signal. Invalidating Passes Registries cache.");
            listenerApi.dispatch(
                passesRegistryApi.util.invalidateTags(['PassesRegistry'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_speaker_trackers") {
            console.log("Received refresh signal. Invalidating Speaker Trackers cache.");
            listenerApi.dispatch(
                speakerTrackerApi.util.invalidateTags(['SpeakerTracker'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_secretarial_roundtables") {
            console.log("Received refresh signal. Invalidating Secretarial Roundtable cache.");
            listenerApi.dispatch(
                secretarialRoundtableApi.util.invalidateTags(['SecretarialRoundtable'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_networking_slots") {
            console.log("Received refresh signal. Invalidating Networking Slot cache.");
            listenerApi.dispatch(
                networkingSlotApi.util.invalidateTags(['NetworkingSlot'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
        }
        else if (action.payload === "refresh_award_subcategories") {
            console.log("Received refresh signal. Invalidating Award Sub Category cache.");
            listenerApi.dispatch(
                awardSubCategoryApi.util.invalidateTags(['AwardSubCategory'])
            );
        }
        //Task related routes
        else if (action.payload === "refresh_taskdescription") {
            console.log("Received refresh signal. Invalidating task update cache.");
            listenerApi.dispatch(
                TaskReportApi.util.invalidateTags(['taskDescription'])
            );
             listenerApi.dispatch(
                TaskDescriptionApi.util.invalidateTags(['taskupdated'])
            );
        }

         else if (action.payload === "refresh_calender") {
            console.log("Received refresh signal. Invalidating calender update cache.");
            listenerApi.dispatch(
                calendarApi.util.invalidateTags(['CalendarEvent'])
            );
        }
    },
});