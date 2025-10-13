# Matrix Editor Conversion Script

# Helper function to get band color classes
function getBandColor(band: BandColor): string {
  switch (band) {
    case 'green':
      return 'bg-emerald-50 border-emerald-200';
    case 'blue':
      return 'bg-sky-50 border-sky-200';
    case 'yellow':
      return 'bg-amber-50 border-amber-200';
    case 'red':
      return 'bg-rose-50 border-rose-200';
  }
}

function getBandTextColor(band: BandColor): string {
  switch (band) {
    case 'green':
      return 'text-emerald-700';
    case 'blue':
      return 'text-sky-700';
    case 'yellow':
      return 'text-amber-700';
    case 'red':
      return 'text-rose-700';
  }
}
