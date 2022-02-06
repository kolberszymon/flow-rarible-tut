import MetaMaskButton from "../components/metaMaskButton";
import { useSdkContext } from "../context/SDKContext";
import { ContractAddress, toContractAddress } from "@rarible/types";
import { useEffect, useState, useCallback } from "react";
import { Maybe } from "../common/maybe";
import { PrepareMintResponse } from "@rarible/sdk/build/types/nft/mint/domain";

export default function Home() {
  const { sdk, wallet } = useSdkContext();
  const [responseObject, setResponseObject] =
    useState<Maybe<PrepareMintResponse>>(null);
  const [isMultipleAllowed, setIsMultipleAllowed] =
    useState<Maybe<boolean>>(null);
  const [isLazyAllowed, setIsLazyAllowed] = useState<Maybe<boolean>>(null);
  const [uri, setUri] = useState<string>(
    "ipfs://ipfs/QmWLsBu6nS4ovaHbGAXprD1qEssJu4r5taQfB74sCG51tp"
  );

  const [supply, setSupply] = useState<string>("1");
  const [lazy, setLazy] = useState<boolean>(true);

  const [collectionId, setCollectionId] = useState(
    "FLOW:A.ebf4ae01d1284af8.RaribleNFT"
  );

  const prepareMint = async () => {
    //Contract Address is de facto Union Address
    //e.g FLOW:A.ebf4ae01d1284af8.RaribleNFT

    let collection;

    try {
      collection = await sdk.apis.collection.getCollectionById({
        collection: collectionId,
      });
    } catch (err) {
      console.log("Bad collection address");
      return;
    }

    const response = await sdk.nft.mint({ collection });

    setResponseObject(response);
    setIsMultipleAllowed(response.multiple);
    setIsLazyAllowed(response.supportsLazyMint);
  };

  const mint = async () => {
    try {
      const mintResponse = await responseObject.submit({
        uri,
        lazyMint: lazy,
        supply: parseInt(supply),
      });
      console.log(mintResponse);
    } catch (err) {
      console.log(err);
    }
    setResponseObject(null);
  };

  return (
    <div className="container font-mono flex items-center p-4 mx-auto min-h-screen justify-center">
      <main className="w-2/3 border-2 border-gray-400 p-2">
        <h1 className=" text-xl code">
          Rarible Union SDK <span className="text-blue-600">Flow</span> minting{" "}
        </h1>
        <br />
        <br />
        <span className="text-blue-600">Collection Id:</span>{" "}
        <input
          value={collectionId}
          className="w-2/3"
          onChange={(e) => {
            setCollectionId(e.target.value);
            setResponseObject(null);
          }}
          placeholder="Collection Id (ex: ETHEREUM:0xc34c39aa3a83afdd35cb65351710cfc56a85c9f4)"
        />
        <br />
        {responseObject && (
          <>
            <span className="text-blue-600">IPFS URI:</span>
            <Input value={uri} onChange={setUri} placeholder="Metadata URI" />
            {isMultipleAllowed && (
              <div>
                Supply:{" "}
                <Input
                  value={supply}
                  onChange={setSupply}
                  placeholder="Supply"
                />
              </div>
            )}
            {isLazyAllowed && (
              <div>
                Lazy-mint:{" "}
                <Checkbox
                  value={lazy}
                  onChange={() => setLazy(!lazy)}
                  label=""
                />
              </div>
            )}
          </>
        )}
        <button
          className="bg-blue-600 text-indigo-50 py-1 px-3 rounded-md mt-10"
          onClick={() => {
            !responseObject ? prepareMint() : mint();
          }}
        >
          {responseObject ? "Mint an NFT" : "Prepare Minting"}
        </button>
      </main>
    </div>
  );
}

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function Input({ value, onChange, placeholder }: InputProps) {
  const onChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <input
      type="text"
      value={value}
      onChange={onChangeCallback}
      style={{ width: 500 }}
      placeholder={placeholder}
    />
  );
}

type CheckboxProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export function Checkbox({ value, onChange, label }: CheckboxProps) {
  const onChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <div>
      <input type="checkbox" checked={value} onChange={onChangeCallback} />
      {label}
    </div>
  );
}
