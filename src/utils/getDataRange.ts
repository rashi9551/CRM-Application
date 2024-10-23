import { AnalyticsFilter } from "../interfaces/interface";

export default  function getDateRanges(filter: string, now: Date) {
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Set date ranges based on the filter
    switch (filter) {
        case AnalyticsFilter.Today:
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // Yesterday
            previousEndDate = startDate; // Today
            break;
        case AnalyticsFilter.Last3Days:
            startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            endDate = now;
            previousStartDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // Previous 3 days
            previousEndDate = startDate; // Last 3 days
            break;
        case AnalyticsFilter.Last7Days:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = now;
            previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // Previous week
            previousEndDate = startDate; // Last week
            break;
        case AnalyticsFilter.Last15Days:
            startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            endDate = now;
            previousStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Previous 15 days
            previousEndDate = startDate; // Last 15 days
            break;
        case AnalyticsFilter.LastMonth:
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 1);
            previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // Previous month
            previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Last month
            break;
        case AnalyticsFilter.ThisMonth:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Rough estimate of a month
            previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Previous month
            previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1); // Last month
            break;
        case AnalyticsFilter.AllTime:
            startDate = new Date(0); // Earliest date
            endDate = now;
            previousStartDate = new Date(0); // Earliest date
            previousEndDate = startDate; // All time
            break;
        default:
            throw new Error('Invalid filter');
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
}