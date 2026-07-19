"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFeatureVector = void 0;
const modelLoader_1 = require("./modelLoader");
function num(value) {
    if (value === null || value === undefined)
        return 0;
    if (typeof value === "boolean")
        return value ? 1 : 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}
function questionnaire(data) {
    const q = data.questionnaire_response ?? {};
    return {
        "q_section_1.age": num(q.section_1?.age),
        "q_section_1.sleep_hours": num(q.section_1?.sleep_hours),
        "q_section_1.exercise_days": num(q.section_1?.exercise_days),
        "q_section_1.family_dementia": num(q.section_1?.family_dementia),
        "q_section_1.long_term_diseases": num(q.section_1?.long_term_diseases),
        "q_section_1.medications_daily": num(q.section_1?.medications_daily),
        "q_section_1.forgotten_times": num(q.section_1?.forgotten_times),
        "q_section_1.falls_past_year": num(q.section_1?.falls_past_year),
        "q_section_2.smoke": num(q.section_2?.smoke),
        "q_section_2.drink": num(q.section_2?.drink),
        "q_section_2.diabetes": num(q.section_2?.diabetes),
        "q_section_2.high_bp": num(q.section_2?.high_bp),
        "q_section_2.high_cholesterol": num(q.section_2?.high_cholesterol),
        "q_section_2.history_stroke": num(q.section_2?.history_stroke),
        "q_section_3.forget_recent": num(q.section_3?.forget_recent),
        "q_section_3.misplace_objects": num(q.section_3?.misplace_objects),
        "q_section_3.confused_dates": num(q.section_3?.confused_dates),
        "q_section_3.trouble_instructions": num(q.section_3?.trouble_instructions),
        "q_section_3.difficult_concentrate": num(q.section_3?.difficult_concentrate),
        "q_section_3.word_finding": num(q.section_3?.word_finding),
        "q_section_3.get_lost": num(q.section_3?.get_lost),
        "q_section_4.mood_changes": num(q.section_4?.mood_changes),
        "q_section_4.feel_irritable": num(q.section_4?.feel_irritable),
        "q_section_4.others_noticed_change": num(q.section_4?.others_noticed_change),
        "q_section_5.need_help_daily": num(q.section_5?.need_help_daily),
        "q_section_5.forget_meals_meds": num(q.section_5?.forget_meals_meds),
        "q_section_5.struggle_money": num(q.section_5?.struggle_money),
        "q_total_score": num(data.q_total_score)
    };
}
function games(data) {
    const g = data.games_response ?? {};
    return {
        ...Object.fromEntries(Object.entries(g.laundry_sorter ?? {}).map(([k, v]) => [
            `g_laundry_sorter.${k}`,
            num(v)
        ])),
        ...Object.fromEntries(Object.entries(g.memory_dialer ?? {}).map(([k, v]) => [
            `g_memory_dialer.${k}`,
            num(v)
        ])),
        ...Object.fromEntries(Object.entries(g.money_manager ?? {}).map(([k, v]) => [
            `g_money_manager.${k}`,
            num(v)
        ])),
        ...Object.fromEntries(Object.entries(g.shopping_list_recall ?? {}).map(([k, v]) => [
            `g_shopping_list_recall.${k}`,
            num(v)
        ]))
    };
}
function eye(data) {
    const metrics = data.eye_tracking_response?.metrics ?? {};
    return {
        "e_total_trials": num(metrics.total_trials),
        "e_correct_trials": num(metrics.correct_trials),
        "e_accuracy": num(metrics.accuracy),
        "e_avg_reaction_time_ms": num(metrics.avg_reaction_time_ms),
        "e_pro_accuracy": num(metrics.pro_accuracy),
        "e_anti_accuracy": num(metrics.anti_accuracy),
        "e_trial_accuracy_calc": num(metrics.trial_accuracy_calc),
        "e_pro_trials": num(metrics.pro_trials),
        "e_anti_trials": num(metrics.anti_trials)
    };
}
function buildFeatureVector(assessment) {
    const { metadata } = (0, modelLoader_1.getAssets)();
    const values = {
        ...questionnaire(assessment),
        ...games(assessment),
        ...eye(assessment)
    };
    return metadata.all_features.map(feature => num(values[feature]));
}
exports.buildFeatureVector = buildFeatureVector;
