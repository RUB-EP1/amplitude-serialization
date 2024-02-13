### A Pluto.jl notebook ###
# v0.19.36

using Markdown
using InteractiveUtils

# ╔═╡ 4389f990-4c09-4256-9991-7b97c0b237b3
using JSON

# ╔═╡ 4d2ab7a3-be39-46bd-a5b1-2f99e321bbe3
md"""
# Example of Serialized Model

The notebook prototypes the way to desctibe model in a dictionary that can be mapped into a readable dictionary.
"""

# ╔═╡ ce089b5b-c3ea-4926-b03f-f2d8b969e475
kinematics = Dict(
	"indices" => (1,2,3,0),
	"names" => ("p", "K", "π", "Lc"),
	"masses" => ("mp", "mK-", "mpi+", "mLc"),
	"spins" => ("1/2", "0", "0", "1/2")
)

# ╔═╡ 3971d8d6-4bac-4ef8-835d-d60a3de2fa6f
chain1 = Dict(
	"weight" => "1.1+1.3im",
	"topology"=> "Lambda_decay_topology",
	"vertices" => [
		Dict(
			"node" => [[2, 3], 1],
			"type" => "LS",
			"L" => "1",
			"S" => "1/2"),
		Dict(
			"node" => [2, 3],
			"type" => "parity",
			"helicities" => ["1/2", "0"],
			"prodparity" => "+")
		],
	"propagators" => [
		Dict(
			"node" => [2, 3],
			"spin" => "3/2",
			"lineshape" => "BW_L1520",
		)
	],
);

# ╔═╡ 3fa57850-ca74-11ee-2f2b-4df27f7e45fc
chains = [chain1, chain1, chain1]

# ╔═╡ 6b737138-6cd6-4507-bb6a-7fe34116304d
other = (
	"Lambda_decay_topology" => [[2, 3], 1],
	"BW_L1520" => Dict(
		"name" => "L1520",
		"type" => "BW",
		"mass" => 1.52,
		"decays" => [(gsq = 1.3, l="1", m1=0.94, m2=0.49, r=1.5)]
		),
	"BW_L1405" => Dict(
		"name" => "L1405",
		"type" => "BW",
		"mass" => 1.4,
		"decays" => [
			(gsq = 0.4, l="0", m1="mp", m2="mK-", r=1.5),
			(gsq = 0.3, l="1", m1="mSigma", m2="mpi+", r=1.5)]
		),
	"mp" => 0.94,
	"mK-" => 0.49,
	"mpi+" => 0.14,
	"mLc" => 2.3,
	"mSigma" => 1.23
)

# ╔═╡ bb47439a-81de-4042-911b-b87d5f67c863
mymodel = Dict(
	"chains" => chains,
	"kinematics" => kinematics,
	other...
)

# ╔═╡ a615dad4-d6b1-427d-822c-50a4c0416f29
file_name = joinpath(@__DIR__, "tmp.json")

# ╔═╡ f92fba71-4066-4890-a1c9-8fc0639a7740
open(file_name, "w") do io
	JSON.print(io, mymodel, 4)
end

# ╔═╡ 00000000-0000-0000-0000-000000000001
PLUTO_PROJECT_TOML_CONTENTS = """
[deps]
JSON = "682c06a0-de6a-54ab-a142-c8b1cf79cde6"

[compat]
JSON = "~0.21.4"
"""

# ╔═╡ 00000000-0000-0000-0000-000000000002
PLUTO_MANIFEST_TOML_CONTENTS = """
# This file is machine-generated - editing it directly is not advised

julia_version = "1.10.0"
manifest_format = "2.0"
project_hash = "ee04d9f7eb5ab00d856f3a8a382fc7b5194aba2f"

[[deps.Dates]]
deps = ["Printf"]
uuid = "ade2ca70-3891-5945-98fb-dc099432e06a"

[[deps.JSON]]
deps = ["Dates", "Mmap", "Parsers", "Unicode"]
git-tree-sha1 = "31e996f0a15c7b280ba9f76636b3ff9e2ae58c9a"
uuid = "682c06a0-de6a-54ab-a142-c8b1cf79cde6"
version = "0.21.4"

[[deps.Mmap]]
uuid = "a63ad114-7e13-5084-954f-fe012c677804"

[[deps.Parsers]]
deps = ["Dates", "PrecompileTools", "UUIDs"]
git-tree-sha1 = "8489905bcdbcfac64d1daa51ca07c0d8f0283821"
uuid = "69de0a69-1ddd-5017-9359-2bf0b02dc9f0"
version = "2.8.1"

[[deps.PrecompileTools]]
deps = ["Preferences"]
git-tree-sha1 = "03b4c25b43cb84cee5c90aa9b5ea0a78fd848d2f"
uuid = "aea7be01-6a6a-4083-8856-8a6e6704d82a"
version = "1.2.0"

[[deps.Preferences]]
deps = ["TOML"]
git-tree-sha1 = "00805cd429dcb4870060ff49ef443486c262e38e"
uuid = "21216c6a-2e73-6563-6e65-726566657250"
version = "1.4.1"

[[deps.Printf]]
deps = ["Unicode"]
uuid = "de0858da-6303-5e67-8744-51eddeeeb8d7"

[[deps.Random]]
deps = ["SHA"]
uuid = "9a3f8284-a2c9-5f02-9a11-845980a1fd5c"

[[deps.SHA]]
uuid = "ea8e919c-243c-51af-8825-aaa63cd721ce"
version = "0.7.0"

[[deps.TOML]]
deps = ["Dates"]
uuid = "fa267f1f-6049-4f14-aa54-33bafae1ed76"
version = "1.0.3"

[[deps.UUIDs]]
deps = ["Random", "SHA"]
uuid = "cf7118a7-6976-5b1a-9a39-7adc72f591a4"

[[deps.Unicode]]
uuid = "4ec0a83e-493e-50e2-b9ac-8f72acf5a8f5"
"""

# ╔═╡ Cell order:
# ╟─4d2ab7a3-be39-46bd-a5b1-2f99e321bbe3
# ╠═4389f990-4c09-4256-9991-7b97c0b237b3
# ╠═ce089b5b-c3ea-4926-b03f-f2d8b969e475
# ╠═3971d8d6-4bac-4ef8-835d-d60a3de2fa6f
# ╠═3fa57850-ca74-11ee-2f2b-4df27f7e45fc
# ╠═6b737138-6cd6-4507-bb6a-7fe34116304d
# ╠═bb47439a-81de-4042-911b-b87d5f67c863
# ╠═a615dad4-d6b1-427d-822c-50a4c0416f29
# ╠═f92fba71-4066-4890-a1c9-8fc0639a7740
# ╟─00000000-0000-0000-0000-000000000001
# ╟─00000000-0000-0000-0000-000000000002
