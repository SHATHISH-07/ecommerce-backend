function extractReturnDays(policy: string): number | null {
    const match = policy.match(/(\d+)\s*days?/i);
    if (!match) return null;

    const days = parseInt(match[1], 10);
    if (days >= 1 && days <= 365) {
        return days;
    }
    return null;
}


export default extractReturnDays;