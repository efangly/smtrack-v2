# thailand-provinces.topojson

Province boundaries for Thailand, simplified with mapshaper (`-simplify dp 3%`) and
converted to TopoJSON for a smaller payload (~205KB, from an original ~25MB GeoJSON).

Source: https://github.com/cvibhagool/thailand-map (`thailand-provinces.geojson`), MIT-style
public dataset. Property `NAME_1` holds the English province name; two features carry a
`(Songkhla Lake)` suffix (a split lake-area polygon for Phatthalung/Songkhla) — treat those as
the same province as their un-suffixed counterpart when grouping.

This boundary data is simplified for UI display only — not suitable for legal/survey use.

# bangkok-metro-districts.topojson

District/amphoe (เขต/อำเภอ) boundaries for the 4 provinces that make up the Bangkok metro
cluster (Bangkok Metropolis, Nonthaburi, Pathum Thani, Samut Prakan) — used for the extra
zoom level into that cluster on the hospital map, since those 4 provinces are too small/tight
relative to the rest of Thailand to click individually at province-level zoom.

Source: [geoBoundaries](https://www.geoboundaries.org) THA ADM2
(`geoBoundaries-THA-ADM2_simplified.geojson`, CC BY 3.0 IGO, via
data.humdata.org/dataset/thailand-administrative-boundaries), filtered down from all 928
Thai districts to the 69 within the 4 metro provinces (matched by point-in-polygon against
`thailand-provinces.topojson`, with 2 border-ambiguous districts — Bang Pakong (Chachoengsao)
and Ongkharak (Nakhon Nayok) — manually excluded after they slipped past the centroid test),
then simplified with mapshaper (`-simplify dp 8%`, ~14.5KB). Property `shapeName` holds the
English district name, `PROVINCE_NAME_1` holds the parent province's English name (matches
`NAME_1` in `thailand-provinces.topojson` for grouping).

This boundary data is simplified for UI display only — not suitable for legal/survey use.
