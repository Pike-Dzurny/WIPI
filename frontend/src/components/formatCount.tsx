export function formatCount(count: number) {
    if (count === 0) {
    return '';
    } else if (count <= 999) {
    return count;
    } else if (count <= 9999) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
    return Math.floor(count / 1000) + 'k';
    }
}
