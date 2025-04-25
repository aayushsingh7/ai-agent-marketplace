function formatDate(dateString:string) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    //@ts-ignore
    const formattedDate = date.toLocaleString('en-GB', options);
    return formattedDate.replace(',', ' at');
}

export default formatDate;
