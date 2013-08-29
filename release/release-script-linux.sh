dir=../src
key=Its-Learning-Reformer.pem
name="Its-Learning-Reformer"
crx="$name.crx"
pub="$name.pub"
sig="$name.sig"
zip="$name.zip"
trap 'rm -f "$pub" "$sig" "$zip"' EXIT
#Read verison from application-version
version=$(cat ../src/manifest.json | jq '.version' | sed 's/\"//g' ) # requires http://stedolan.github.io/jq/
versionArray=(${version//./ })
majorVersion=${versionArray[0]}
minorVersion=${versionArray[1]}
echo "Current version: $majorVersion.$minorVersion"
minorVersion=$(($minorVersion + 1))
echo "New version:     $majorVersion.$minorVersion"
echo "
Updating version in manifest file" 
sed "s#\"version\":.*#\"version\": \""$majorVersion"."$minorVersion"\",#"  ../src/manifest.json >> temp
mv temp ../src/manifest.json
echo "Done!"
echo "
Updating version in update.xml"
sed "s#<updatecheck codebase.*#<updatecheck codebase='https://github.com/dogbrain/Its-Learning-Reformer/raw/master/release/Its-Learning-Reformer.crx' version='"$majorVersion"."$minorVersion"' />#"  update.xml >> temp
mv temp update.xml
echo "Done!"
echo "
Building file"
# zip up the crx dir
cwd=$(pwd -P)
(cd "$dir" && zip -qr -9 -X "$cwd/$zip" .)

# signature
openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"

# public key
openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

byte_swap () {
  # Take "abcdefgh" and return it as "ghefcdab"
  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
}

crmagic_hex="4372 3234" # Cr24
version_hex="0200 0000" # 2
pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
(
  echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
  cat "$pub" "$sig" "$zip"
) > "$crx"
echo "Wrote $crx"
