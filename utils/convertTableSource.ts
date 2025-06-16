// cases_detailed -> Cases
export const convertTableSource = (tableSource: string): string => {
  let formattedSource = tableSource.replace(/_detailed/g, ' ');
  return formattedSource.charAt(0).toUpperCase() + formattedSource.slice(1);
};
