for i in $(ls metadata/gen); do
    wrangler r2 object put theassetsclub/tokens/$i --file=metadata/gen/$i
done